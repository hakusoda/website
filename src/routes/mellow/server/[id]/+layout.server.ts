import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
import supabase, { handle_response } from '$lib/server/supabase';
import { get_discord_server_member_from_platform_user } from '$lib/server/discord';
export const load = async ({ params: { id }, locals: { session } }) => {
	const response = await supabase.rpc('mellow_server_accessible_by_user2', {
		user_id: session!.sub,
		server_id: id
	});
	handle_response(response);

	const discord_member = await get_discord_server_member_from_platform_user(id, session!.sub);
	if (!response.data && !discord_member)
		throw requestError(404, RequestErrorType.Unauthorised);

	const response2 = await supabase.from('mellow_servers')
		.select<string, {
			name: string
			webhooks: {
				id: string
				name: string
				events: number
				enabled: boolean
				creator: {
					name: string | null
					username: string
				} | null
				target_url: string
				created_at: string
			}[]
			avatar_url: string | null
			owner_team: {
				display_name: string
			} | null
			owner_user_id: string
		}>('name, webhooks:mellow_server_webhooks ( id, name, events, creator:users ( name, username ), enabled, target_url, created_at ), avatar_url, owner_team:teams ( display_name ), owner_user_id')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handle_response(response2);

	if (!response2.data)
		throw requestError(404, RequestErrorType.NotFound);

	return {
		...response2.data,
		is_member: response.data as boolean
	};
};