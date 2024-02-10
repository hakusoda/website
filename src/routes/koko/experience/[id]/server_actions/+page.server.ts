import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('koko_experience_server_actions')
		.select<string, {
			id: string
			name: string
			creator: {
				name: string | null
				username: string
			} | null
			created_at: string
		}>('id, name, creator:users ( name, username ), created_at')
		.eq('experience_id', id)
		.order('created_at');
	handleResponse(response);

	return { items: response.data! };
}