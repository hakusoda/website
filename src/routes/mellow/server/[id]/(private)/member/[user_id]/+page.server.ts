import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id, user_id } }) {
	const response = await supabase.from('user_connections')
		.select<string, {
			user: {
				name: string
				username: string
				settings: {
					user_connections: {
						id: string
					}[]
				}
			}
		}>('user:users ( name, username, settings:mellow_user_server_settings ( user_connections ) )')
		.eq('sub', user_id)
		.eq('user.connections.server_id', id)
		.limit(1)
		.single();
	handle_response(response);

	return response.data!.user;
}