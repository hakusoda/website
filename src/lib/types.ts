import type { ZodIssue } from 'zod';
import type { TeamRole, RequestErrorType, RobloxLinkType, RobloxLinkFlag, UserNotificationType, UserNotificationState } from './enums';
export interface User {
	id: string
	bio: string | null
	name: string | null
	flags: number
	username: string
	avatar_url: string | null
	mellow_ids: string[]
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
	members: {
		role: TeamRole
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
		joined_at: string
	}[]
	projects: {
		id: string
		name: string
		summary: string
		avatar_url: string | null
		banner_url: string | null
		created_at: string
		display_name: string
		contributors: { id: string }[]
		external_contributors: number
	}[]
	avatar_url: string | null
	created_at: string
	display_name: string
}

export interface TeamMember {
	id: string
	bio: string | null
	name: string | null
	role: TeamRole
	flags: number
	username: string
	joined_at: string
	avatar_url: string | null
	created_at: string
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

export interface RequestError {
	error: RequestErrorType
	issues?: ZodIssue[]
}

export type ApiResponse<T> = RequestError & {
	success: false
} | {
	data: T
	success: true
}