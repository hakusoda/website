import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { LayoutServerLoad } from './$types';
import { verifyServerMembership } from '$lib/util/server';
export const load = (async ({ params: { id }, locals: { getSession } }) => {
	await verifyServerMembership(await getSession(), id);

	const { data, error } = await supabase.from<string, {
		name: string
	}>('mellow_servers').select('name').eq('id', id).limit(1).single();
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	return data;
}) satisfies LayoutServerLoad;