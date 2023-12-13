import { isUUID } from '$lib/util';
import type { TeamAuditLogType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { name } }) {
	const response = await supabase.from('team_audit_logs')
		.select<string, TeamAuditLog>('id, type, data, team:teams!inner ( name ), author:users!team_audit_logs_author_id_fkey ( id, name, username, avatar_url ), created_at, target_user:users!team_audit_logs_target_user_id_fkey ( name, username )')
		.eq(isUUID(name) ? 'team_id' : 'team.name', name)
		.order('created_at', { ascending: false });
	handleResponse(response);

	return { items: response.data! };
}

interface TeamAuditLogBase {
	id: string
	type: TeamAuditLogType
	author: {
		id: string
		name: string | null
		username: string
		avatar_url: string
	}
	created_at: string
	target_user: {
		name: string | null
		username: string
	} | null
}

interface TeamAuditLogRenameTeam extends TeamAuditLogBase {
	data: [string, string]
	type: TeamAuditLogType.RenameTeam
}

interface TeamAuditLogUpdateRole extends TeamAuditLogBase {
	data: {
		name: [string, string | undefined]
		position: [number, number | undefined]
		permissions: [number, number | undefined]
	}
	type: TeamAuditLogType.UpdateRole
}

type TeamAuditLog = TeamAuditLogRenameTeam | TeamAuditLogUpdateRole