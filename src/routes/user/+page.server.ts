import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ parent }) => {
	const { user } = await parent();
	if (user)
		throw redirect(302, `/user/${user.username}`);
	throw redirect(302, '/');
}) satisfies PageServerLoad;