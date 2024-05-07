import { getDiscordServerChannels } from '$lib/server/discord';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			logging_types: number
			logging_channel_id: string | null
		}>('logging_types, logging_channel_id')
		.eq('id', id)
		.limit(1)
		.single();
	handle_response(response);

	return {
		...response.data!,
		channels: await getDiscordServerChannels(id)
	};
}