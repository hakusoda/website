import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
import { getDiscordServerRoles } from '$lib/server/discord';
import type { InternalSyncAction } from '$lib/shared/types/mellow/syncing';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id } }) {
	const response = handle_response(await supabase.from('mellow_server_sync_actions')
		.select<string, InternalSyncAction>('id, kind, criteria, action_data, display_name, creator:users!mellow_server_sync_actions_creator_id_fkey ( name, username ), created_at, updated_at, updated_by:users!mellow_server_sync_actions_updated_by_fkey ( name, username )')
		.eq('server_id', id)
		.order('created_at')
	);

	const roles = await getDiscordServerRoles(id);
	if (!roles.success) {
		console.error(roles.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		items: response.data!,
		roles: roles.data
			.filter(role => role.name !== '@everyone' && !role.managed)
			.sort((a, b) => b.position - a.position)
			.map(role => ({ id: role.id, name: role.name.trim().replace(/^ㅤ+|ㅤ+$/g, ''), icon: role.icon }))
	};
}