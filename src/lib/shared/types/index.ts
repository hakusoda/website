import type { ZodIssue } from 'zod';

import type { RequestErrorType, DiscordChannelType, UserConnectionKind, UserNotificationType, UserNotificationState } from '../enums';
export interface User {
	id: string
	name: string | null
	username: string
	avatar_url: string | null

	created_at: string
}

export interface UserNotification {
	id: string
	data: any
	type: UserNotificationType
	state: UserNotificationState
	created_at: string
	target_user: {
		name: string
		username: string
		avatar_url: string | null
	} | null
	target_team: {
		name: string
		avatar_url: string | null
		display_name: string
	} | null
}

export interface Team {
	id: string
	bio: string
	name: string
	members: TeamMember[]
	avatar_url: string | null
	created_at: string
	display_name: string
}

export interface DatabaseTeam {
	id: string
	bio: string | null
	name: string
	flags: number
	roles: {
		id: string
		name: string
		position: number
		permissions: number
	}[]
	owner: {
		id: string
		name: string | null
		username: string
		avatar_url: string | null
	} | null
	creator: {
		name: string | null
		username: string
		avatar_url: string | null
	} | null
	members: {
		user: {
			id: string
			bio: string | null
			name: string | null
			flags: number
			username: string
			joined_at: string
			avatar_url: string | null
			created_at: string
		}
		role_id: string
		joined_at: string
	}[]
	avatar_url: string | null
	created_at: string
	website_url: string | null
	display_name: string
	affiliations: {
		team: {
			name: string
			avatar_url: string | null
			display_name: string
		}
	}[]
	parent_affiliations: {
		team: {
			name: string
			avatar_url: string | null
			display_name: string
		}
	}[]
}

export interface TeamMember {
	id: string
	bio: string | null
	name: string | null
	role: {
		id: string
		name: string
		position: number
	}
	flags: number
	username: string
	joined_at: string
	avatar_url: string | null
	created_at: string
}

export interface TeamInvite {
	id: string
	author: {
		name: string | null
		username: string
		avatar_url: string | null
	} | null
}

export type TeamActionLogType =
	'team.created' |
	'team.renamed' |
	'team.avatar.updated' |
	'team.public_profile.updated' |
	'team.role.created' |
	'team.role.updated' |
	'team.role.deleted' |
	'team.member.updated' |
	'team.member.removed' |
	'team.member_invitation.created' |
	'team.mellow_server.transferred.to_here'

export type MellowActionLogItemType =
	'mellow.server.created' |
	'mellow.server.webhook.created' |
	'mellow.server.webhook.updated' |
	'mellow.server.webhook.deleted' |
	'mellow.server.syncing.action.created' |
	'mellow.server.syncing.action.updated' |
	'mellow.server.syncing.action.deleted' |
	'mellow.server.syncing.settings.updated' |
	'mellow.server.discord_logging.updated' |
	'mellow.server.api_key.created' |
	'mellow.server.ownership.changed'

export interface MellowRemoveMemberMetadata {
	audit_log_reason: string | null
	user_facing_reason: string | null
}

export interface DiscordRole {
	id: string
	name: string
	icon: string | null
	flags: number
	color: number
	hoist: boolean
	managed: boolean
	position: number
	permissions: string
	mentionable: boolean
	description: string | null
	unicode_emoji: string | null
}

export interface DiscordServer {
	id: string
	name: string
	icon: string | null
	roles: DiscordRole[]
	owner?: boolean
	splash: string | null
	banner: string | null
	//emojis: DiscordEmoji[]
	owner_id: string
	//features: DiscordGuildFeature[]
	//stickers?: DiscordSticker[]
	//mfa_level: DiscordGuildMFALevel
	icon_hash?: string | null
	//nsfw_level: DiscordGuildNSFWLevel
	afk_timeout: number
	description: string | null
	permissions?: string
	max_members?: number
	//premium_tier: DiscordGuildPremiumTier
	max_presences?: number | null
	application_id: string | null
	afk_channel_id: string | null
	widget_enabled?: boolean
	//welcome_screen?: DiscordWelcomeScreen
	vanity_url_code: string | null
	//preferred_locale: DiscordLocale
	rules_channel_id: string | null
	discovery_splash: string | null
	system_channel_id: string | null
	widget_channel_id?: string | null
	verification_level: number
	system_channel_flags: number
	explicit_content_filter: number
	max_video_channel_users?: number
	safety_alerts_channel_id: string | null
	approximate_member_count?: number
	public_updates_channel_id: string | null
	approximate_presence_count?: number
	premium_subscription_count?: number
	premium_progress_bar_enabled: boolean
	default_message_notifications: number
	max_stage_video_channel_users?: number
}

export interface DiscordChannel {
	id: string
	name: string
	type: DiscordChannelType
	guild_id?: string
	position?: number
	permission_overwrites?: any[]
}

export interface RequestError {
	error: RequestErrorType
	issues?: ZodIssue[]
}

export interface ApiRequestError {
	error: any
	issues?: ZodIssue[]
}

export type ApiResponse<T> = ApiRequestError & {
	data: unknown
	success: false
} | {
	data: T
	error: null
	success: true
}

export interface CreateTeamResponse {
	id: string
	name: string
	display_name: string
}

export interface UpdateTeamPayload {
	bio?: string | null
	name?: string
	website_url?: string | null
	display_name?: string
}

export interface UpdateTeamMemberPayload {
	role_id: string | null
}

export interface UpdateTeamRolePayload {
	name?: string
	position?: number
	permissions?: number
}

export interface UpdateProfilePayload {
	bio?: string | null
	name?: string | null
	username?: string
}

export interface Pagination<T> {
	limit: number
	offset: number
	results: T[]
	total_results: number
}

export type ActionLogItem = {
	id: string
	type: TeamActionLogType | MellowActionLogItemType
	author: {
		id: string
		name: string | null
		username: string
		avatar_url: string | null
	} | null
	created_at: string
	data_changes: ({
		name: string
		kind: 'created'
		value: any
	} | {
		name: string
		kind: 'updated'
		new_value: any
		old_value: any
	} | {
		name: string
		kind: 'deleted'
		old_value: any
	})[]
	target_team_role?: {
		id: string
		name: string
	} | null
	target_user?: {
		id: string
		name: string | null
		username: string
		avatar_url: string | null
	} | null
	target_command?: {
		id: string
		name: string
	} | null
	target_webhook?: {
		id: string
		name: string
	} | null
	target_sync_action?: {
		id: string
		display_name: string
	} | null
}

export interface UpdateMellowServerProfileSyncingSettingsPayload {
	default_nickname?: string
	skip_onboarding_to?: UserConnectionKind | null
	allow_forced_syncing?: boolean
}

export interface CreateMellowWebhookPayload {
	name: string
	events?: number
	enabled?: boolean
	target_url: string
}

export interface UpdateMellowServerOwnershipPayload {
	team_id?: string
	user_id?: string
}

export interface GenerateMellowServerApiKeyResponse {
	api_key: string
}

export interface GetSignUpOptionsPayload {
	username: string
}

export interface VerifySignUpPayload {
	username: string
	challenge: string
	transports: string[]
	attestation: string
	device_public_key: string
}

export interface VerifySignUpResponse {
	jwt: string
	user_id: string
	refresh: string
}

export interface VerifySignInPayload {
	id: string
	username: string
	auth_data: string
	challenge: string
	signature: string
	client_data: string
	device_public_key: string
}

export interface VerifyNewDevicePayload {
	name: string
	challenge: string
	transports: string[]
	attestation: string
	device_public_key?: string
}

export interface VerifyNewDeviceResponse {
	id: string
	name: string
	user_os: string
	last_used_at: string
	user_country: string | null
	user_platform: string
}

export interface VerifySudoModePayload {
	id: string
	authData: string
	challenge: string
	signature: string
	clientData: string
}

export interface GroupSelectItem {
	id: string
	name: string
	icon?: string
	type?: 'self' | 'steam' | 'roblox'
	avatar_url: string
}

export interface KokoExperienceServer {
	id: string
	players: KokoExperienceServerPlayer[]
	place_id: number
	experience: PartialKokoExperience
	created_at: string
	place_version: number
	private_server_id: string | null
}

export interface KokoExperienceServerPlayer {
	id: number
	name: string
	username: string
	has_verified_badge: boolean

	joined_at: string
	joined_via_user: number
}

export interface PartialKokoExperience {
	id: number
}

export interface UserSessionJWT {
	sub: string
	iat: number
	source_device_id: string
	device_public_key: string

	/**@deprecated */
	source_connection_id?: string
	
	/**@deprecated */
	source_connection_type?: UserConnectionKind
}