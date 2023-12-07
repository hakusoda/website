import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const load = (async ({ locals: { session } }) => {
	if (session)
		throw redirect(302, `/user/${session.sub}`);
}) satisfies PageServerLoad;