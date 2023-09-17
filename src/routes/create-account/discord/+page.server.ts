import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import supabase, { handleResponse } from '$lib/supabase';
import { getDiscordToken, getDiscordUser } from '$lib/verification';
import { FeatureFlag, RequestErrorType, UserConnectionType } from '$lib/enums';
import { requestError, createUserSession, createRefreshToken, throwIfFeatureNotEnabled } from '$lib/util/server';
export const load = (async ({ url, cookies }) => {
	await throwIfFeatureNotEnabled(FeatureFlag.MellowSignUp);
	
	const code = url.searchParams.get('code');
	if (!code)
		throw requestError(400, RequestErrorType.InvalidBody);

	const response = await getDiscordToken(code, `https://${url.host}/create-account/discord`);
	if (!response.success) {
		console.error(response);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	const { token_type, access_token } = response.data;
	const response2 = await getDiscordUser(access_token, token_type);
	if (!response2.success) {
		console.error(response2);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	const user = response2.data;
	const avatar_url = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'webp'}?size=256` : null;
	
	const id = crypto.randomUUID();
	const username = user.username.replace(/\W/g, '');
	const response3 = await supabase.from('users').insert({
		id,
		name: user.global_name,
		username,
		is_edited: true,
		avatar_url,
		mellow_pending: true
	});
	handleResponse(response3);

	const response4 = await supabase.from('user_connections').insert({
		sub: user.id,
		type: UserConnectionType.Discord,
		name: `${user.global_name ?? user.username} (@${user.username})`,
		user_id: id,
		metadata: user
	});
	handleResponse(response4);

	const [token] = await createUserSession(id);
	const refresh = await createRefreshToken(id);
	const cookieOptions = { path: '/', domain: 'voxelified.com', expires: new Date(Date.now() + 31556926000), sameSite: 'none', httpOnly: false } as const;
	cookies.set('auth-token', token, cookieOptions);
	cookies.set('refresh-token', refresh, cookieOptions);

	throw redirect(302, '/roblox/authorise');
}) satisfies PageServerLoad;