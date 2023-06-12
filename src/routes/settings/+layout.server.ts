import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ locals: { getSession }, parent }) => {
	if (!await getSession() || !(await parent()).user)
		throw redirect(302, '/login');
}) satisfies LayoutServerLoad;