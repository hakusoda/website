import { error } from '@sveltejs/kit';

import { getTeam } from '$lib/database';
import type { PageServerLoad } from './$types';
export const load = (async ({ params: { name } }) => {
	const team = await getTeam(name);
	if (!team)
		throw error(404);

	return team;
}) satisfies PageServerLoad;