export interface User {
	id: string
	bio: string | null
	name: string | null
	flags: number
	username: string
	avatar_url: string

	created: string
}

export type ApiResponse<T> = {
	error: true
	error_id: string
} | {
	data: T
	error: false
}