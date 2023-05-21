import type { Handle } from '@sveltejs/kit';
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON } from '$env/static/public';
export const handle = (async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseServerClient({
		event,
		supabaseUrl: PUBLIC_SUPABASE_URL,
		supabaseKey: PUBLIC_SUPABASE_ANON
	});
	event.locals.getSession = async () => (await event.locals.supabase.auth.getSession()).data.session;

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range';
		}
	});
}) satisfies Handle;