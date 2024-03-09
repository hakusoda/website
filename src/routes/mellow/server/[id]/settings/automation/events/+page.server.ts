import type { EventResponseItem } from '$lib/types';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			member_join_event_response_tree: EventResponseItem[]
		}>('member_join_event_response_tree')
		.eq('id', id)
		.limit(1)
		.single();
	handleResponse(response);

	return response.data!;
}