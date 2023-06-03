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
	
	target_id: number
	
	created_at: string
}

export interface RobloxUser {
	id: number
	name: string
	displayName: string
	hasVerifiedBadge: boolean
}

export type ApiResponse<T> = {
	error: true
	error_id: string
} | {
	data: T
	error: false
}