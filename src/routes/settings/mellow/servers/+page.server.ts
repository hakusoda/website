import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	const { data, error } = await supabase.from('mellow_servers').select<string, {
		id: string
		name: string
		members: { id: string }[]
		avatar_url: string
	}>('id, name, avatar_url, members:mellow_server_members!inner ( id )').in('members.user_id', [session!.user.id]);
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(404);

	return { servers: data };
}) satisfies PageServerLoad;