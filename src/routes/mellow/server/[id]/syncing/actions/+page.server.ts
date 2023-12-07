import { requestError } from '$lib/util/server';
import type { PageServerLoad } from './$types';
import { getDiscordServerRoles } from '$lib/discord';
import supabase, { handleResponse } from '$lib/supabase';
import { MellowProfileSyncActionType, RequestErrorType, MellowServerAuditLogType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_binds')
		.select<string, {
			id: string
			name: string
			type: MellowProfileSyncActionType
			edits: {
				type: MellowServerAuditLogType
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
	handleResponse(response);

	const roles = await getDiscordServerRoles(id);
	if (!roles.success) {
		console.error(roles.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		items: response.data!.map(item => {
			const edits = item.edits.filter(item => item.type === MellowServerAuditLogType.UpdateProfileSyncAction);
			return {
				...item,
				edits: undefined,
				last_edit: edits.reverse()[0]
			};
		}),
		roles: roles.data.filter(role => role.name !== '@everyone' && !role.managed).sort((a, b) => b.position - a.position).map(role => ({ id: role.id, name: role.name.trim().replace(/^ㅤ+|ㅤ+$/g, '') }))
	};
}) satisfies PageServerLoad;