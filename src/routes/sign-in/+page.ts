import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
export const load = (async ({ parent }) => {
	const { user, session } = await parent();
	if (user || session)
		throw redirect(302, `/user/${user?.username ?? session?.user.id}`);
}) satisfies PageLoad;