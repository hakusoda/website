import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			api_key_created_at: string | null
		}>('api_key_created_at')
		.eq('id', id)
		.limit(1)
		.single();
	handleResponse(response);

	return response.data;
}