import { error } from '@sveltejs/kit';

import { getTeam, getUsers } from '$lib/database';
import type { PageServerLoad } from './$types';
export const load = (async ({ params: { name } }) => {
	const team = await getTeam(name);
	if (!team)
		throw error(404);

	const members = await getUsers(team.members.map(member => member.user_id))
		.then(users => users.map(user => ({ ...user, ...team.members.find(m => m.user_id === user.id)! })))
		.then(users => users.sort((a, b) => b.role - a.role));
	return { team, members };
}) satisfies PageServerLoad;