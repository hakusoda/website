import type { Platform, RobloxLinkType, RobloxLinkFlag } from './enums';
export interface User {
	id: string
	bio: string | null
	name: string | null
	flags: number
	username: string
	avatar_url: string

	created: string
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

export type ApiResponse<T> = {
	error: true
	error_id: string
} | {
	data: T
	error: false
}