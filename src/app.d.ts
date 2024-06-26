import 'unplugin-icons/types/svelte';
import type { UserSessionJWT, UserNotification } from '$lib/shared/types';
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
				accent_colour: number
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
			notifications: UserNotification[]
		}
		// interface Platform {}
	}
}

export {};