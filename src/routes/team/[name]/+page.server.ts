import { error } from '@sveltejs/kit';

import { getTeam } from '$lib/database';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name } }) => {
	const team = await getTeam(name);
	if (!team)
		throw error(404, JSON.stringify({
			error: RequestErrorType.NotFound
		} satisfies RequestError));

	return team;
}) satisfies PageServerLoad;