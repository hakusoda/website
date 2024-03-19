import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			api_key_created_at: string | null
		}>('api_key_created_at')
		.eq('id', id)
		.limit(1)
		.single();
	handle_response(response);

	return response.data!;
}