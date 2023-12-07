import type { ZodIssue } from 'zod';
import type { RequestErrorType, DiscordChannelType, UserConnectionType, UserNotificationType, UserNotificationState, MellowServerAuditLogType, MellowProfileSyncActionType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from './enums';
export interface User {
	id: string
	bio: string | null
	name: string | null
	flags: number
	username: string
	avatar_url: string | null
	mellow_pending: boolean

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
	target_profile_post_id: string | null
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
	projects: {
		id: string
		name: string
		flags: number
		summary: string
		avatar_url: string | null
		banner_url: string | null
		created_at: string
		updated_at: string
		archived_at: string | null
		theme_color: string | null
		display_name: string
		contributors: { id: string }[]
		external_contributors: number
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

export type MellowProfileAction = {
	id: string
	name: string
	creator: {
		name: string | null
		username: string
	} | null
	metadata: {}
	last_edit: {
		type: MellowServerAuditLogType
		author: {
			name: string | null
			username: string
		}
		created_at: string
	}
	created_at: string
	requirements: {
		id: string
		data: string[]
		type: MellowProfileSyncActionRequirementType
	}[]
	requirements_type: MellowProfileSyncActionRequirementsType
} & ({
	type: MellowProfileSyncActionType.GiveRoles
	metadata: {
		items: string[]
		can_remove: boolean
	}
} | {
	type: MellowProfileSyncActionType.BanFromServer
	metadata: MellowRemoveMemberMetadata & {
		delete_messages_seconds: number
	}
} | {
	type: MellowProfileSyncActionType.KickFromServer
	metadata: MellowRemoveMemberMetadata
} | {
	type: MellowProfileSyncActionType.CancelSync
	metadata: {
		user_facing_reason: string | null
	}
})

export interface MellowRemoveMemberMetadata {
	audit_log_reason: string | null
	user_facing_reason: string | null
}

export interface MellowProfileActionRequirement {
	id: string
	data: string[]
	type: MellowProfileSyncActionRequirementType
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

export interface UpdateMellowUserServerSettingsPayload {
	connections: {
		id: string
	}[]
}

export interface UpdateMellowServerProfileSyncingSettingsPayload {
	default_nickname?: string
	skip_onboarding_to?: UserConnectionType | null
	allow_forced_syncing?: boolean
}

export interface CreateMellowProfileSyncActionPayload {
	name: string
	type: MellowProfileSyncActionType
	metadata: any
	requirements: {
		data: string[]
		type: MellowProfileSyncActionRequirementType
	}[]
	requirements_type: MellowProfileSyncActionRequirementsType
}

export interface CreateMellowProfileSyncActionResponse {
	id: string
	name: string
	creator: {
		name: string | null
		username: string
	}
	created_at: string
	target_ids: string[]
	requirements: {
		id: string
		data: string[]
		type: MellowProfileSyncActionRequirementType
	}[]
	requirements_type: MellowProfileSyncActionRequirementsType
}

export interface CreateUserPostPayload {
	content: string
	attachments?: {
		url: string
	}[]
}
export interface CreateUserPostResponse {
	id: string
	content: string
	created_at: string
	attachments: {
		url: string
	}[]
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

export interface UserSessionJWT {
	sub: string
	iat: number
	exp: number
}