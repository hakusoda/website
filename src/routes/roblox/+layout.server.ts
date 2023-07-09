import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ parent }) => {
	if (!(await parent()).session)
		throw redirect(302, '/login');
}) satisfies LayoutServerLoad;