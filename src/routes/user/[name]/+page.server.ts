import { getUser } from '$lib/api';
import type { PageServerLoad } from './$types';
export const load = (async ({ parent, params: { name } }) => {
	const { user } = await parent();
	if (user && (user.id === name || user.username === name))
		return { profile: user };
	return { profile: getUser(name) };
}) satisfies PageServerLoad;