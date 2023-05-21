import { createSupabaseLoadClient } from '@supabase/auth-helpers-sveltekit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON } from '$env/static/public';

import type { Database } from '../app';
import type { LayoutLoad } from './$types.js';
export const load = (async ({ fetch, data, depends }) => {
	depends('supabase:auth');

	const supabase = createSupabaseLoadClient<Database>({
		event: { fetch },
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON,
		serverSession: data.session
	});

	const { data: { session } } = await supabase.auth.getSession();
	return { user: data.user, supabase, session }
}) satisfies LayoutLoad;