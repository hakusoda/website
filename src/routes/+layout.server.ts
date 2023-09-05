import { redirect } from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';

import { env } from '$env/dynamic/private';
import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
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
export const load = (async ({ url, locals: { supabase, getSession } }) => {
	const session = await getSession();
	const user = session ? cachedUsers[session.user.id] ??= await getUser(session) : null;
	if (session && !user) { // assuming the user's account has been deleted, we end their session.
		await supabase.auth.signOut({ scope: 'global' });
		throw redirect(302, url.href);
	}

	const notifications = session ? await getUserNotifications(session.user.id) : [];
	return {
		user,
		session,
		analyticsId: env.VERCEL_ANALYTICS_ID,
		notifications
	};
}) satisfies LayoutServerLoad;

async function getUser(session: Session) {
	const response = await supabase.from('users')
		.select('id, name, username, avatar_url, mellow_pending, connections:user_connections ( sub, type )')
		.eq('id', session.user.id)
		.limit(1)
		.maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return response.data;
}