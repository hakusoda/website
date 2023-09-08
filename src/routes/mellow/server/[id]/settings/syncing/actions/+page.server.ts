import { error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import type { PageServerLoad } from './$types';
import { getDiscordServerRoles } from '$lib/discord';
import { MellowProfileSyncActionType, RequestErrorType, MellowServerAuditLogType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_binds').select<string, {
		id: string
		name: string
		data: string[]
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
		created_at: string
		requirements: {
			id: string
			data: string[]
			type: MellowProfileSyncActionRequirementType
		}[]
		requirements_type: MellowProfileSyncActionRequirementsType
	}>('id, name, type, data, creator:users ( name, username ), created_at, requirements_type, requirements:mellow_bind_requirements ( id, type, data ), edits:mellow_server_audit_logs ( type, author:users ( name, username ), created_at )').eq('server_id', id).order('created_at');
	if (response.error)
		console.error(response.error);

	if (response.error || !response.data)
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));

	const roles = await getDiscordServerRoles(id);
	if (!roles.success) {
		console.error(roles.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	return {
		binds: response.data.map(item => {
			const edits = item.edits.filter(item => item.type === MellowServerAuditLogType.UpdateRobloxLink);
			return {
				...item,
				edits: undefined,
				last_edit: edits.reverse()[0]
			};
		}),
		roles: roles.data.filter(role => role.name !== '@everyone' && !role.managed).sort((a, b) => b.position - a.position).map(role => ({ id: role.id, name: role.name }))
	};
}) satisfies PageServerLoad;