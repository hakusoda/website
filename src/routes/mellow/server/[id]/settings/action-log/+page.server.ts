import supabase, { handleResponse } from '$lib/supabase';
import type { MellowProfileActionRequirement } from '$lib/types';
import type { MellowServerAuditLogType, MellowProfileSyncActionType, MellowProfileSyncActionRequirementsType } from '$lib/enums';

export const config = { regions: ['iad1'] };
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_server_audit_logs')
		.select<string, MellowServerAuditLog>('id, type, data, author:users( id, name, username, avatar_url ), created_at, target_link_id')
		.eq('server_id', id)
		.order('created_at', { ascending: false });
	handleResponse(response);

	return { items: response.data! };
};

interface MellowServerAuditLogBase {
	id: string
	type: MellowServerAuditLogType
	author: {
		id: string
		name: string
		username: string
		avatar_url: string
	}
	created_at: string
	target_link_id: string | null
}

interface MellowServerAuditLogCreateProfileSyncAction extends MellowServerAuditLogBase {
	data: {
		name: string
		type: MellowProfileSyncActionType
		data: string[]
		requirements: number
		requirements_type: MellowProfileSyncActionRequirementsType
	}
	type: MellowServerAuditLogType.CreateProfileSyncAction
}

interface MellowServerAuditLogUpdateProfileSyncingSettings extends MellowServerAuditLogBase {
	data: {
		default_nickname: [string, string | undefined]
		allow_forced_syncing?: [boolean, boolean | undefined]
	}
	type: MellowServerAuditLogType.UpdateProfileSyncingSettings
}

interface MellowServerAuditLogDeleteProfileSyncAction extends MellowServerAuditLogBase {
	data: {
		name: string
	}
	type: MellowServerAuditLogType.DeleteProfileSyncAction
}

interface MellowServerAuditLogUpdateProfileSyncAction extends MellowServerAuditLogBase {
	data: {
		name: [string, string | undefined]
		data: [string[], string[] | undefined]
		type: [MellowProfileSyncActionType, MellowProfileSyncActionType | undefined]
		requirements?: [MellowProfileActionRequirement[], MellowProfileActionRequirement[] | undefined]
		requirements_type: [MellowProfileSyncActionRequirementsType, MellowProfileSyncActionRequirementsType | undefined]
	}
	type: MellowServerAuditLogType.UpdateProfileSyncAction
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
	MellowServerAuditLogCreateProfileSyncAction |
	MellowServerAuditLogUpdateProfileSyncingSettings |
	MellowServerAuditLogDeleteProfileSyncAction |
	MellowServerAuditLogUpdateProfileSyncAction |
	MellowServerAuditLogUpdateLogging