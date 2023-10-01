import { isUUID } from '$lib/util';
import type { PageServerLoad } from './$types';
import supabase, { handleResponse } from '$lib/supabase';
export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name } }) => {
	const response = await supabase.from('teams')
		.select<string, {
			applications: {
				id: string
				name: string
				summary: string | null
				created_at: string
				avatar_url: string | null
			}[]
		}>('applications ( id, name, summary, avatar_url, created_at )')
		.eq(isUUID(name) ? 'id' : 'name', name)
		.limit(1)
		.single();
	handleResponse(response);

	return response.data!;
}) satisfies PageServerLoad;