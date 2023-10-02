import type { ZodIssue } from 'zod';
import type { MellowProfileSyncActionType, RequestErrorType, RobloxLinkType, RobloxLinkFlag, DiscordChannelType, UserNotificationType, UserNotificationState, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from './enums';
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

export interface RobloxLink {
	id: string
	type: RobloxLinkType
	owner: string
	flags: RobloxLinkFlag
	public: boolean
	
	target_id: number
	
	created_at: string
}

export interface PartialRobloxUser {
	id: number
	name: string
	displayName: string
	hasVerifiedBadge: boolean
}
export interface RobloxUser extends PartialRobloxUser {
	created: string
	isBanned: boolean
	description: string
	externalAppDisplayName: null
}

export interface PartialRobloxGroup {
	id: number
	name: string
	memberCount: number
	hasVerifiedBadge: boolean
}

export interface RobloxGetGroupsResponse {
	data: {
		id: number
		name: string
		owner: {
			id: number
			type: 'User'
		}
		created: string
		description: number
		hasVerifiedBadge: boolean
	}[]
}

export interface RobloxLookupGroupsResponse {
	data: PartialRobloxGroup[]
}

export interface RobloxThumbnailsResponse {
	data: {
		state: 'Success' | 'Error'
		imageUrl: string
		targetId: number
	}[]
}

export interface RobloxGroupRole {
	id: number
	name: string
	rank: number
	description: string
	memberCount: number
}

export interface RobloxGroupRolesResponse {
	roles: RobloxGroupRole[]
	groupId: number
}

export interface MellowLink {
	name: string
	data: string[]
	type: MellowProfileSyncActionType
	creator: {
		name: string | null
		username: string
	}
	created_at: string
	requirements: MellowProfileActionRequirement[]
	requirements_type: MellowProfileSyncActionRequirementsType
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

export interface DiscordChannel {
	id: string
	name: string
	type: DiscordChannelType
	guild_id?: string
	position?: number
	permission_overwrites?: any[]
}

export interface DiscordPartialUser {
	id: string
	bot?: boolean
	avatar: string | null
	username: string
	global_name: string | null
	public_flags: number
	discriminator: string
	avatar_decoration: string | null
}

// https://discord.com/developers/docs/resources/guild#guild-member-object
export interface DiscordMember {
	deaf: boolean
	mute: boolean
	nick: string | null
	user: DiscordPartialUser
	flags: number
	roles: string[]
	avatar: string | null
	pending: boolean
	joined_at: string
	permissions: string
	premium_since: unknown
	communication_disabled_until: unknown
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

export interface CreateMellowServerRobloxLinkPayload {
	name: string
	data: string[]
	type: MellowProfileSyncActionType
	requirements: {
		data: string[]
		type: MellowProfileSyncActionRequirementType
	}[]
	requirements_type: MellowProfileSyncActionRequirementsType
}

export interface CreateMellowServerRobloxLinkResponse {
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
}

export interface VerifySignUpResponse {
	jwt: string
	user_id: string
	refresh: string
}

export interface VerifySignInPayload {
	id: string
	username: string
	authData: string
	challenge: string
	signature: string
	clientData: string
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