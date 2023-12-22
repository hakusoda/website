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
		// interface PageData {}
		// interface Platform {}
	}
}

export {};