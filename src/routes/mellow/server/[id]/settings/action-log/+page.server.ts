import supabase, { handleResponse } from '$lib/supabase';
import type { MellowProfileActionRequirement } from '$lib/types';
import type { MellowProfileSyncActionType, MellowProfileSyncActionRequirementsType } from '$lib/enums';
export async function load({ params: { id } }) {
	return { streamed: {
		items: supabase.from('mellow_server_audit_logs')
			.select<string, MellowServerAuditLog>('id, type, data, author:users( id, name, username, avatar_url ), created_at, target_action:mellow_binds ( id, name )')
			.eq('server_id', id)
			.order('created_at', { ascending: false })
			.then(handleResponse)
			.then(response => response.data!)
	} };
}

type MellowServerAuditLog = {
	id: string
	author: {
		id: string
		name: string
		username: string
		avatar_url: string
	}
	created_at: string
	target_action: {
		id: string
		name: string
	} | null
} & ({
	data: {
		name: string
		type: MellowProfileSyncActionType
		data: string[]
		requirements: number
		requirements_type: MellowProfileSyncActionRequirementsType
	}
	type: 'mellow.server.syncing.action.created'
} | {
	data: {
		default_nickname: [string, string | undefined]
		allow_forced_syncing?: [boolean, boolean | undefined]
	}
	type: 'mellow.server.syncing.settings.updated'
} | {
	data: {
		name: string
	}
	type: 'mellow.server.syncing.action.deleted'
} | {
	data: {
		name: [string, string | undefined]
		data: [string[], string[] | undefined]
		type: [MellowProfileSyncActionType, MellowProfileSyncActionType | undefined]
		requirements?: [MellowProfileActionRequirement[], MellowProfileActionRequirement[] | undefined]
		requirements_type: [MellowProfileSyncActionRequirementsType, MellowProfileSyncActionRequirementsType | undefined]
	}
	type: 'mellow.server.syncing.action.updated'
} | {
	data: {
		types: [number, number | undefined]
		channel: [string | null, string | undefined | null]
		channel_id: [string | null, string | undefined | null]
	}
	type: 'mellow.server.discord_logging.updated'
})