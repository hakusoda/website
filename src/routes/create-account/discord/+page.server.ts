import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { getDiscordToken, getDiscordUser } from '$lib/verification';
import { RequestErrorType, UserConnectionType } from '$lib/enums';
export const load = (async ({ url, locals: { supabase: supabase2 }, parent }) => {
	const { session } = await parent();
	if (session)
		throw error(400, JSON.stringify({
			error: RequestErrorType.Unknown
		} satisfies RequestError));

	const code = url.searchParams.get('code');
	if (!code)
		throw error(400, JSON.stringify({
			error: RequestErrorType.InvalidBody
		} satisfies RequestError));

	const response = await getDiscordToken(code, `${url.origin}/create-account/discord`);
	if (!response.success) {
		console.error(response);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	const { token_type, access_token } = response.data;
	const response2 = await getDiscordUser(access_token, token_type);
	if (!response2.success) {
		console.error(response2);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	const user = response2.data;
	const avatar_url = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256` : null;
	const response3 = await supabase.auth.admin.createUser({
		email: user.email,
		app_metadata: {
			provider: 'discord',
			providers: 'discord'
		},
		user_metadata: {
			sub: user.id,
			iss: 'https://discord.com/api',
			name: user.username,
			email: user.email,
			picture: avatar_url,
			full_name: user.global_name,
			avatar_url,
			provider_id: user.id,
			email_verified: true
		},
		email_confirm: true
	});
	if (response3.error) {
		console.error(response3.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.DatabaseUpdate
		} satisfies RequestError));
	}

	const username = user.username.replace(/\W/g, '');
	const response4 = await supabase.from('users').insert({
		id: response3.data.user.id,
		name: user.global_name,
		username,
		avatar_url,
		mellow_pending: true
	});
	if (response4.error) {
		console.error(response4.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.DatabaseUpdate
		} satisfies RequestError));
	}

	const response5 = await supabase.from('user_connections').insert({
		sub: user.id,
		type: UserConnectionType.Discord,
		name: `${user.global_name} (@${user.username})`,
		user_id: response3.data.user.id,
		metadata: user
	});
	if (response5.error) {
		console.error(response5.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.DatabaseUpdate
		} satisfies RequestError));
	}

	const response6 = await supabase.auth.admin.generateLink({
		type: 'magiclink',
		email: user.email
	});
	if (response6.error) {
		console.error(response6.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	await supabase2.auth.verifyOtp({
		type: 'email',
		email: user.email,
		token: response6.data.properties.email_otp
	});

	throw redirect(302, '/roblox/authorise');
}) satisfies PageServerLoad;