import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ parent }) => {
	const { user, session } = await parent();
	if (!session || !user)
		throw redirect(302, '/sign-in');
}) satisfies LayoutServerLoad;