import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load = (async ({ url, locals: { session } }) => {
	if (session)
		throw redirect(302, url.searchParams.get('redirect_uri') || `/user/${session.sub}`);
}) satisfies PageServerLoad;