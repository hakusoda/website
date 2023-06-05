import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import supabase from '$lib/supabase';
import { MELLOW_KEY } from '$env/static/private';
import { getDiscordToken, getDiscordUser } from '$lib/verification';
export const load = (async ({ url, locals: { getSession, supabase: supabase2 } }) => {
	const session = await getSession();
	if (session)
		throw error(400, 'you already have an account');

	const code = url.searchParams.get('code');
	if (!code)
		throw error(400, 'invalid code');
	const response = await getDiscordToken(code, `${url.origin}/create-account/discord`);
	if (response.error) {
		console.error(response);
		throw error(500, (response as any).error_description);
	}

	const { token_type, access_token } = response.data;
	const response2 = await getDiscordUser(access_token, token_type);
	if (response2.error) {
		console.error(response2);
		throw error(500, (response2 as any).error_description);
	}

	const user = response2.data;
	const avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
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
			picture: avatar,
			full_name: user.global_name,
			avatar_url: avatar,
			provider_id: user.id,
			email_verified: true
		},
		email_confirm: true
	});
	if (response3.error) {
		console.log(response3.error);
		throw error(500, response3.error.message);
	}

	fetch(avatar).then(async response => {
		if (response.status === 200)
			supabase.storage.from('avatars').upload(`user/${response3.data.user.id}.png`, await response.arrayBuffer()).catch(console.error);
		else
			console.error(response.status, response.statusText);
	}).catch(console.error);

	const username = user.username.replace(/\W/g, '');
	const response4 = await supabase.from('users').insert({
		id: response3.data.user.id,
		name: user.global_name,
		username,
		mellow_ids: [user.id],
		mellow_pending: true
	});
	if (response4.error) {
		console.log(response4.error);
		throw error(500, response4.error.message);
	}

	const response5 = await supabase.auth.admin.generateLink({
		type: 'magiclink',
		email: user.email
	});
	if (response5.error) {
		console.log(response5.error);
		throw error(500, response5.error.message);
	}

	await supabase2.auth.verifyOtp({
		type: 'magiclink',
		email: user.email,
		token: response5.data.properties.email_otp
	});

	fetch('https://mellow.voxelified.com/signup-finished', {
		body: `${response3.data.user.id}:${user.id}`,
		method: 'POST',
		headers: {
			'x-api-key': MELLOW_KEY
		}
	});
	throw redirect(302, '/roblox/authorise');
}) satisfies PageServerLoad;