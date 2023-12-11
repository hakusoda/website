import { redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { UserSessionJWT } from '$lib/types';
import { getUserNotifications } from '$lib/database';
import type { LayoutServerLoad } from './$types';

export const config = { runtime: 'edge' };
export const load = (async ({ url, locals: { session }, cookies }) => {
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
}) satisfies LayoutServerLoad;

async function getUser(session: UserSessionJWT) {
	const response = await supabase.from('users')
		.select('id, name, username, avatar_url, created_at')
		.eq('id', session.sub)
		.limit(1)
		.maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return response.data;
}