import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { PageServerLoad } from './$types';
export const load = (async () => {
	const { data, error } = await supabase.from('mellow_servers').select<string, {
		id: string
		name: string
		avatar_url: string
	}>('id, name, avatar_url');
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(404);

	return { servers: data };
}) satisfies PageServerLoad;