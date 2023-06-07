import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ locals: { getSession } }) => {
	if (!await getSession())
		throw redirect(302, '/login');
}) satisfies LayoutServerLoad;