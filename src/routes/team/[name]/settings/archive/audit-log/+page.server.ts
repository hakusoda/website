import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';
import type { TeamAuditLogType } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name } }) => {
	const response = await supabase.from('team_audit_logs')
		.select<string, TeamAuditLog>('id, type, data, team:teams!inner ( name ), author:users( name, username, avatar_url ), created_at').eq(isUUID(name) ? 'team_id' : 'team.name', name).order('created_at', { ascending: false });
	if (response.error)
		console.error(response.error);

	if (response.error || !response.data)
		throw requestError(500, RequestErrorType.ExternalRequestError);

	return { items: response.data };
}) satisfies PageServerLoad;

interface TeamAuditLogBase {
	id: string
	type: TeamAuditLogType
	author: {
		name: string | null
		username: string
		avatar_url: string
	}
	created_at: string
}

interface TeamAuditLogRenameTeam extends TeamAuditLogBase {
	data: [string, string]
	type: TeamAuditLogType.RenameTeam
}

type TeamAuditLog = TeamAuditLogRenameTeam