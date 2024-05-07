import type { UserConnectionKind } from '../../enums';
export type SyncAction = BaseSyncAction & SyncActions;
export type InternalSyncAction = BaseSyncActionButInformative & SyncActions;

type SyncActions = {
	kind: 'discord.member.assign_roles'
	action_data: {
		role_ids: string[]
		can_remove: boolean
	}
} | {
	kind: 'control_flow.cancel' | 'discord.member.ban' | 'discord.member.kick'
	action_data: {
		reason: string | null
		user_facing_details: string | null
	}
} | {
	kind: 'visual_scripting.execute_document'
	action_data: null
}

export type SyncActionKind = SyncAction['kind']

interface BaseSyncAction {
	criteria: Criteria
	display_name: string
}

interface BaseSyncActionButInformative extends BaseSyncAction {
	id: string
	creator: {
		name: string | null
		username: string
	} | null
	created_at: string
	updated_at: string
	updated_by: {
		name: string | null
		username: string
	} | null
}

export interface Criteria {
	items: CriteriaItem[]
	quantifier: Quantifier
}

export type CriteriaItem = {
	kind: 'hakumi.user.connection'
	connection_kind?: UserConnectionKind
} | {
	kind: 'mellow.server.syncing.actions'
	action_ids: string[]
	quantifier: Quantifier
} | {
	kind: 'roblox.group.membership'
	group_id?: number
} | {
	kind: 'roblox.group.membership.role'
	role_id?: number
	group_id?: number
} | {
	kind: 'roblox.group.membership.role.rank.in_range'
	group_id?: number
	range_lower: number
	range_upper: number
} | {
	kind: 'patreon.campaign.tier_subscription'
	tier_id?: number
	campaign_id?: number
}

export type CriteriaItemKind = CriteriaItem['kind']

export type Quantifier = {
	kind: 'all'
} | {
	kind: 'at_least'
	value: number
}

export type QuantifierKind = Quantifier['kind']

export interface AutoImportRequest {
	items: AutoImportItem[]
}

export type AutoImportItem = BaseAutoImportItem & ({
	kind: 'roblox.group.role'
	role_id: number
	group_id: number
	discord_role: {
		kind: 'create_new'
		name: string
	} | {
		kind: 'use_existing'
		role_id: string
	}
})

export interface BaseAutoImportItem {
	display_name: string
}

export type AutoImportItemKind = AutoImportItem['kind']