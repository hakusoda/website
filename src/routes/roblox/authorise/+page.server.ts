import { redirect } from '@sveltejs/kit';

import { FeatureFlag } from '$lib/enums';
import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import type { PageServerLoad } from './$types';
import { throwIfFeatureNotEnabled } from '$lib/util/server';
export const load = (async ({ url }) => {
	await throwIfFeatureNotEnabled(FeatureFlag.RobloxAccountLinking);
	throw redirect(302, `https://apis.roblox.com/oauth/v1/authorize?client_id=${PUBLIC_ROBLOX_ID}&scope=openid&redirect_uri=${encodeURIComponent(`https://${url.host}/roblox/authorise/finish`)}&response_type=code`);
}) satisfies PageServerLoad;