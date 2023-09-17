import { redirect } from '@sveltejs/kit';

import { PUBLIC_ROBLOX_ID } from '$env/static/public';
import type { PageServerLoad } from './$types';
export const load = (({ url }) => {
	throw redirect(302, `https://apis.roblox.com/oauth/v1/authorize?client_id=${PUBLIC_ROBLOX_ID}&scope=openid&redirect_uri=${encodeURIComponent(`https://${url.host}/roblox/authorise/finish`)}&response_type=code`);
}) satisfies PageServerLoad;