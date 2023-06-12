import { redirect } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import { getUser } from '$lib/database';
import type { LayoutServerLoad } from './$types';
export const config = { runtime: 'edge' };
export const load = (async ({ url, locals: { getSession } }) => {
	const session = await getSession();
	const user = session ? await getUser(session.user.id) : null;
	if (session && !user && url.pathname !== '/login/profile')
		throw redirect(302, '/login/profile');
	return { user, session, analyticsId: env.VERCEL_ANALYTICS_ID };
}) satisfies LayoutServerLoad;