import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { OpenCloudClient, InvalidOAuthGrantError, exchangeOAuthCodeForMethod } from '@voxelified/roblox-open-cloud';

import { ROBLOX_SECRET } from '$env/static/private';
import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import supabase, { handleResponse } from '$lib/supabase';
import { requestFail, requestError, throwIfFeatureNotEnabled } from '$lib/util/server';
import { FeatureFlag, RobloxLinkType, RobloxLinkFlag, RequestErrorType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ url, locals: { session } }) => {
	await throwIfFeatureNotEnabled(FeatureFlag.RobloxAccountLinking);
	
	const code = url.searchParams.get('code');
	if (!code)
		throw requestError(400, RequestErrorType.InvalidBody);

	const auth = await exchangeOAuthCodeForMethod(PUBLIC_ROBLOX_ID as any, ROBLOX_SECRET as any, code)
		.catch(error => {
			if (error instanceof InvalidOAuthGrantError)
				throw redirect(302, '/roblox/authorise');
			throw requestError(500, RequestErrorType.ExternalRequestError);
		});

	const { scope, id_token, token_type, expires_in, access_token, refresh_token } = auth.data;
	const response2 = await supabase.from('mellow_roblox_oauth_tokens').upsert({
		scope,
		user_id: session!.sub,
		id_token,
		token_type,
		expires_in,
		access_token,
		refresh_token
	}, { onConflict: 'user_id' });
	handleResponse(response2);

	const user = await new OpenCloudClient(auth).users.get()!;
	const response3 = await supabase.from('roblox_links').insert({
		type: RobloxLinkType.User,
		flags: RobloxLinkFlag.None,
		public: false,
		owner_id: session!.sub,
		target_id: user.sub
	}).select('id');
	handleResponse(response3);

	return {
		user,
		linkId: response3.data![0].id
	};
}) satisfies PageServerLoad;

export const actions = {
	confirm: async ({ locals: { session }, request }) => {
		if (!session)
			throw requestFail(401, RequestErrorType.Unauthenticated);

		const data = await request.text();
		const response = await supabase.from('roblox_links')
			.update({
				flags: RobloxLinkFlag.Verified
			})
			.eq('id', data)
			.eq('owner_id', session.sub);
		handleResponse(response);
	}
} satisfies Actions;