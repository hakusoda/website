import { redirect } from '@sveltejs/kit';

import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import type { PageServerLoad } from './$types';
export const load = (() => {
	throw redirect(302, `https://apis.roblox.com/oauth/v1/authorize?client_id=${PUBLIC_ROBLOX_ID}&scope=openid%20profile&redirect_uri=https://www.voxelified.com/roblox/verification-finish&response_type=code`);
}) satisfies PageServerLoad;