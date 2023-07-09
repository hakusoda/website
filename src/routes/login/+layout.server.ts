import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ url, parent }) => {
	const { user, session } = await parent();
	if (user)
		throw redirect(302, `/user/${user.username}`);
	if (session && url.pathname !== '/login/profile')
		throw redirect(302, `/login/profile`);
	return { url: url.origin };
}) satisfies LayoutServerLoad;