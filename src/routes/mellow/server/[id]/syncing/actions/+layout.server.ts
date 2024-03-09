import { requestError } from '$lib/server/util';
import { getDiscordServerRoles } from '$lib/server/discord';
import supabase, { handle_response } from '$lib/server/supabase';
import type { MellowActionLogItemType } from '$lib/shared/types';
import { MellowProfileSyncActionType, RequestErrorType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '$lib/shared/enums';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_binds')
		.select<string, {
			id: string
			name: string
			type: MellowProfileSyncActionType
			edits: {
				type: MellowActionLogItemType
				author: {
					name: string | null
					username: string
				}
				created_at: string
			}[]
			creator: {
				name: string | null
				username: string
			} | null
			metadata: any
			created_at: string
			requirements: {
				id: string
				data: string[]
				type: MellowProfileSyncActionRequirementType
			}[]
			requirements_type: MellowProfileSyncActionRequirementsType
		}>('id, name, type, metadata, creator:users ( name, username ), created_at, requirements_type, requirements:mellow_bind_requirements ( id, type, data ), edits:mellow_server_audit_logs ( type, author:users ( name, username ), created_at )')
		.eq('server_id', id)
		.order('created_at');
	handle_response(response);

	const roles = await getDiscordServerRoles(id);
	if (!roles.success) {
		console.error(roles.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		items: response.data!.map(item => {
			const edits = item.edits.filter(item => item.type === 'mellow.server.syncing.action.updated');
			return {
				...item,
				edits: undefined,
				last_edit: edits.reverse()[0]
			};
		}) as (Omit<NonNullable<typeof response.data>[number], 'edits'> & { last_edit?: NonNullable<typeof response.data>[number]['edits'][number] })[],
		roles: roles.data.filter(role => role.name !== '@everyone' && !role.managed).sort((a, b) => b.position - a.position).map(role => ({ id: role.id, name: role.name.trim().replace(/^ㅤ+|ㅤ+$/g, '') }))
	};
}