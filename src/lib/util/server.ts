import * as kit from '@sveltejs/kit';
import type { Session } from '@supabase/supabase-js';

import supabase from '../supabase';
export async function verifyServerMembership(session: Session | null, serverId: string) {
	if (!session)
		throw kit.redirect(302, '/login');

	const { data, error } = await supabase.from('mellow_server_members').select('id').eq('user_id', session.user.id).eq('server_id', serverId).limit(1).maybeSingle();
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(403);
}