import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { PageServerLoad } from './$types';
import type { TeamAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name } }) => {
	const { data, error } = await supabase.from('team_audit_logs')
		.select<string, TeamAuditLog>('id, type, data, team:teams ( name ), author:users( name, username, avatar_url ), created_at').eq(isUUID(name) ? 'team_id' : 'team.name', name).order('created_at', { ascending: false });
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(500);

	return { items: data };
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