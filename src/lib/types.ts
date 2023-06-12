import type { ZodIssue } from 'zod';
import type { TeamRole, RequestErrorType, RobloxLinkType, RobloxLinkFlag } from './enums';
export interface User {
	id: string
	bio: string | null
	name: string | null
	flags: number
	username: string
	avatar_url: string
	mellow_ids: string[]
	mellow_pending: boolean

	created_at: string
}

export interface Team {
	id: string
	bio: string
	name: string
	members: TeamMember[]
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
			created_at: string
			avatar_url: string
		}
		joined_at: string
	}[]
	projects: {
		id: string
		name: string
		summary: string
		created_at: string
		display_name: string
		contributors: { id: string }[]
		external_contributors: number
	}[]
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
	created_at: string
	avatar_url: string
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
	error_id: RequestErrorType
	zod_issues?: ZodIssue[]
}

export type ApiResponse<T> = {
	error: true
	error_id: string
} | {
	data: T
	error: false
}