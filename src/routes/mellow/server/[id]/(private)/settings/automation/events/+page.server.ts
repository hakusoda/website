import type { EventResponseItem } from '$lib/shared/types';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			member_join_event_response_tree: EventResponseItem[]
		}>('member_join_event_response_tree')
		.eq('id', id)
		.limit(1)
		.single();
	handle_response(response);

	return response.data!;
}