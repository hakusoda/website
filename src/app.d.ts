import type { UserSessionJWT } from '$lib/types';
export interface Database {
	public: {
		Views: {}
		Tables: {}
		Functions: {}
	}
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			session: UserSessionJWT | null
		}
		interface PageData {
			user: {
				id: string
				name: string | null
				username: string
				avatar_url: string | null
				created_at: string
				teams: {
					team: {
						id: string
						name: string
						owner_id: string | null
						avatar_url: string | null
						display_name: string | null
					}
					role: {
						permissions: number
					} | null
				}[]
			} | null
			session: UserSessionJWT | null
		}
		// interface Platform {}
	}
}

export {};