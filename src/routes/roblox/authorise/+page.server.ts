import { redirect } from '@sveltejs/kit';
import { createOAuthLink } from '@voxelified/roblox-open-cloud';

import { FeatureFlag } from '$lib/enums';
import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import type { PageServerLoad } from './$types';
import { throwIfFeatureNotEnabled } from '$lib/util/server';
export const load = (async ({ url }) => {
	await throwIfFeatureNotEnabled(FeatureFlag.RobloxAccountLinking);
	throw redirect(302, createOAuthLink(PUBLIC_ROBLOX_ID as any, `https://${url.host}/roblox/authorise/finish`, 'openid profile'));
}) satisfies PageServerLoad;