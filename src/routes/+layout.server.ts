import { redirect } from '@sveltejs/kit';

import type { UserSessionJWT } from '$lib/types';
import { getUserNotifications } from '$lib/database';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ url, locals: { session }, cookies }) {
	const user = session ? await getUser(session) : null;
	if (session && !user) {
		cookies.delete('auth-token', { path: '/', domain: '.hakumi.cafe' });
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);
	}

	const notifications = session ? await getUserNotifications(session.sub) : [];
	return {
		user,
		session,
		notifications
	};
}

async function getUser(session: UserSessionJWT) {
	const response = await supabase.from('users')
		.select('id, name, username, avatar_url, created_at')
		.eq('id', session.sub)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	return response.data!;
}