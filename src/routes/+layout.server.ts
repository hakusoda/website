import { redirect } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import supabase from '$lib/supabase';
import { getUserAvatar } from '$lib/database';
import type { LayoutServerLoad } from './$types';

const cachedUsers: Record<string, {
	id: string
	name: string | null
	username: string
} | null> = {};
export const config = { runtime: 'edge' };
export const load = (async ({ url, locals: { getSession } }) => {
	const session = await getSession();
	const user = session ? cachedUsers[session.user.id] || (cachedUsers[session.user.id] = (await supabase.from('users').select('id, name, username').eq('id', session.user.id).limit(1).maybeSingle()).data) : null;
	if (session && !user && url.pathname !== '/login/profile')
		throw redirect(302, '/login/profile');

	return {
		user: user ? {
			...user,
			avatar_url: getUserAvatar(user.id)
		} : null,
		session,
		analyticsId: env.VERCEL_ANALYTICS_ID
	};
}) satisfies LayoutServerLoad;