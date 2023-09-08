import { error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { PageServerLoad } from './$types';
import type { MellowProfileSyncActionType, MellowServerAuditLogType, MellowProfileSyncActionRequirementsType } from '$lib/enums';

export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_server_audit_logs')
		.select<string, MellowServerAuditLog>('id, type, data, author:users( name, username, avatar_url ), created_at, target_link_id').eq('server_id', id).order('created_at', { ascending: false });
	if (response.error)
		console.error(response.error);

	if (response.error || !response.data)
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));

	return { items: response.data };
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
	target_link_id: string | null
}

interface MellowServerAuditLogCreateRobloxLink extends MellowServerAuditLogBase {
	data: {
		name: string
		type: MellowProfileSyncActionType
		data: string[]
		requirements: number
		requirements_type: MellowProfileSyncActionRequirementsType
	}
	type: MellowServerAuditLogType.CreateRobloxLink
}

interface MellowServerAuditLogUpdateRobloxGlobalSettings extends MellowServerAuditLogBase {
	data: {
		default_nickname: [string, string | undefined]
		sync_unknown_users?: [boolean, boolean | undefined]
		allow_forced_syncing?: [boolean, boolean | undefined]
	}
	type: MellowServerAuditLogType.UpdateRobloxGlobalSettings
}

interface MellowServerAuditLogDeleteRobloxLink extends MellowServerAuditLogBase {
	data: {
		name: string
	}
	type: MellowServerAuditLogType.DeleteRobloxLink
}

interface MellowServerAuditLogUpdateRobloxLink extends MellowServerAuditLogBase {
	data: {
		name: [string, string | undefined]
		data: [string[], string[] | undefined]
		type: [MellowProfileSyncActionType, MellowProfileSyncActionType | undefined]
		requirements?: [unknown[], unknown[] | undefined]
		requirements_type: [MellowProfileSyncActionRequirementsType, MellowProfileSyncActionRequirementsType | undefined]
	}
	type: MellowServerAuditLogType.UpdateRobloxLink
}

interface MellowServerAuditLogUpdateLogging extends MellowServerAuditLogBase {
	data: {
		types: [number, number | undefined]
		channel: [string | null, string | undefined | null]
		channel_id: [string | null, string | undefined | null]
	}
	type: MellowServerAuditLogType.UpdateLogging
}

type MellowServerAuditLog =
	MellowServerAuditLogCreateRobloxLink |
	MellowServerAuditLogUpdateRobloxGlobalSettings |
	MellowServerAuditLogDeleteRobloxLink |
	MellowServerAuditLogUpdateRobloxLink |
	MellowServerAuditLogUpdateLogging