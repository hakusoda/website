import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.from('mellow_server_members')
		.select<string, {
			server: {
				id: string
				name: string
				members: [{ count: number }]
				avatar_url: string
			}
		}>('server:mellow_servers ( id, name, avatar_url, members:mellow_server_members ( count ) )')
		.eq('user_id', session.sub);
	handleResponse(response);

	return { servers: response.data!.map(item => item.server).sort((a, b) => a.name.localeCompare(b.name)) };
};