import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ url, locals: { session } }) => {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);
}) satisfies LayoutServerLoad;