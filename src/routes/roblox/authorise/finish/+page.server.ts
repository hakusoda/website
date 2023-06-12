import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import supabase from '$lib/supabase';
import { ROBLOX_SECRET } from '$env/static/private';
import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import { getRobloxUserInfo } from '$lib/verification';
import { RobloxLinkType, RobloxLinkFlag } from '$lib/enums';
import { request, getRobloxUser, getRobloxAvatars } from '$lib/api';
export const config = { regions: ['iad1'] };
export const load = (async ({ url, locals: { getSession } }) => {
	const session = (await getSession())!;

	const code = url.searchParams.get('code');
	if (!code)
		throw error(400, 'invalid code');

	const params = new URLSearchParams();
	params.set('code', code);
	params.set('client_id', PUBLIC_ROBLOX_ID);
	params.set('grant_type', 'authorization_code');
	params.set('client_secret', ROBLOX_SECRET);

	const response = await request<TokenResponse>('https://apis.roblox.com/oauth/v1/token', 'POST', params, {
		'content-type': 'application/x-www-form-urlencoded'
	});
	if (response.error) {
		console.log(response);
		throw redirect(302, '/roblox/authorise');
		//throw error(500, (response as any).error_description);
	}

	const { scope, id_token, expires_in, token_type, access_token, refresh_token } = response.data;
	const response2 = await supabase.from('roblox_oauth').insert({
		scope,
		user_id: session.user.id,
		id_token,
		token_type,
		expires_at: Date.now() + expires_in * 1000,
		access_token,
		refresh_token
	});
	if (response2.error) {
		console.log(response2.error);
		throw error(500, response2.error.message);
	}

	const response3 = await getRobloxUserInfo(access_token, token_type);
	if (response3.error) {
		console.log(response3.error);
		throw error(500, 'something went wrong...');
	}

	const response4 = await supabase.from('roblox_links').insert({
		type: RobloxLinkType.User,
		owner: session.user.id,
		flags: RobloxLinkFlag.None,
		public: false,
		target_id: response3.data.sub
	}).select('id');
	if (response4.error) {
		console.log(response4.error);
		throw error(500, response4.error.message);
	}

	const id = response3.data.sub;
	return {
		user: getRobloxUser(id),
		icon: getRobloxAvatars([id], '150x150').then(data => data[0]),
		linkId: response4.data[0].id
	};
}) satisfies PageServerLoad;

export const actions = {
	confirm: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			throw error(401);

		const data = await request.text();
		const response4 = await supabase.from('roblox_links').update({
			flags: RobloxLinkFlag.Verified
		}).eq('id', data).eq('owner', session.user.id);
		if (response4.error) {
			console.log(response4.error);
			throw error(500, 'something went wrong...');
		}
	}
} satisfies Actions;

export interface TokenResponse {
	scope: string
	id_token: string
	expires_in: number
	token_type: 'Bearer'
	access_token: string
	refresh_token: string
}