import type { Session, SupabaseClient } from '@supabase/supabase-js';
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
			supabase: SupabaseClient<Database>
			getSession(): Promise<Session | null>
		}
		interface PageData {
			session: Promise<Session | null>
			supabase?: SupabaseClient<Database>
		}
		// interface Platform {}
	}
}

export { };