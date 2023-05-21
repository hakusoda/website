import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ url, parent, locals: { getSession } }) => {
	const user = (await parent()).user;
	if (user)
		throw redirect(302, `/user/${user.username}`);
	if (await getSession() && url.pathname !== '/login/profile')
		throw redirect(302, `/login/profile`);
	return { url: url.origin };
}) satisfies LayoutServerLoad;