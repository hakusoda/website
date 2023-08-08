import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const config = { runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { user } = await parent();
	if (user)
		throw redirect(302, `/user/${user.username}`);
	throw redirect(302, '/');
}) satisfies PageServerLoad;