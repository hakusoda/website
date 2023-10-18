import { redirect } from '@sveltejs/kit';

import { env } from '$env/dynamic/private';
import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { UserSessionJWT } from '$lib/types';
import { getUserNotifications } from '$lib/database';
import type { LayoutServerLoad } from './$types';
import type { UserConnectionType } from '$lib/enums';

const cachedUsers: Record<string, {
	id: string
	name: string | null
	username: string
	avatar_url: string
	connections: {
		sub: string
		type: UserConnectionType
	}[]
	mellow_pending: boolean
} | null> = {};
export const config = { runtime: 'edge' };
export const load = (async ({ url, locals: { session }, cookies }) => {
	const user = session ? cachedUsers[session.sub] ??= await getUser(session) : null;
	if (session && !user) {
		cookies.delete('auth-token', { path: '/', domain: '.voxelified.com' });
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);
	}

	const notifications = session ? await getUserNotifications(session.sub) : [];
	return {
		user,
		session,
		analyticsId: env.VERCEL_ANALYTICS_ID,
		notifications
	};
}) satisfies LayoutServerLoad;

async function getUser(session: UserSessionJWT) {
	const response = await supabase.from('users')
		.select('id, name, username, avatar_url, mellow_pending, connections:user_connections ( sub, type )')
		.eq('id', session.sub)
		.limit(1)
		.maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return response.data;
}