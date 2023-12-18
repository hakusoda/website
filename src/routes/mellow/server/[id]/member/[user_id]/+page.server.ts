import { UserConnectionType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { id, user_id } }) {
	const response = await supabase.from('user_connections')
		.select<string, {
			user: {
				name: string
				username: string
				connections: {
					connection: {
						sub: string
						type: UserConnectionType
						username: string | null
						avatar_url: string | null
						website_url: string | null
						display_name: string | null
					}
					last_used_at: string
				}[]
			}
		}>('user:users ( name, username, connections:mellow_user_server_connections ( last_used_at, connection:user_connections ( sub, type, username, avatar_url, website_url, display_name ) ) )')
		.eq('sub', user_id)
		.eq('type', UserConnectionType.Discord)
		.eq('user.connections.server_id', id)
		.limit(1)
		.single();
	handleResponse(response);

	return response.data!.user;
}