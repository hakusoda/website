import { isUUID } from '$lib/util';
import supabase, { handleResponse } from '$lib/supabase';
export const config = { regions: ['iad1'], runtime: 'edge' };
export async function load({ params: { name } }) {
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
};