import { isUUID } from '$lib/shared/util';
import supabase, { handle_response } from '$lib/server/supabase';
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
	handle_response(response);

	return response.data!;
}