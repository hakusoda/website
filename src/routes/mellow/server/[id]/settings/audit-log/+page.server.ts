import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { PageServerLoad } from './$types';
import type { MellowBindType, MellowServerAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const { data, error } = await supabase.from('mellow_server_audit_logs')
		.select<string, MellowServerAuditLog>('id, type, data, author:users( name, username, avatar_url ), created_at').eq('server_id', id).order('created_at', { ascending: false });
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(500);

	return { items: data };
}) satisfies PageServerLoad;

interface MellowServerAuditLogBase {
	id: string
	type: MellowServerAuditLogType
	author: {
		name: string
		username: string
		avatar_url: string
	}
	created_at: string
}

interface MellowServerAuditLogCreateRobloxLink extends MellowServerAuditLogBase {
	data: {
		name: string
		type: MellowBindType
		targets: number
		requirements: number
		requirements_type: number
	}
	type: MellowServerAuditLogType.CreateRobloxLink
}

interface MellowServerAuditLogUpdateRobloxGlobalSettings extends MellowServerAuditLogBase {
	data: {
		default_nickname?: [string, string]
	}
	type: MellowServerAuditLogType.UpdateRobloxGlobalSettings
}

interface MellowServerAuditLogDeleteRobloxLink extends MellowServerAuditLogBase {
	data: {
		name: string
	}
	type: MellowServerAuditLogType.DeleteRobloxLink
}

type MellowServerAuditLog =
	MellowServerAuditLogCreateRobloxLink |
	MellowServerAuditLogUpdateRobloxGlobalSettings |
	MellowServerAuditLogDeleteRobloxLink