import { error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { getTeam } from '$lib/database';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';
import type { TeamInvite, RequestError } from '$lib/types';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name }, parent }) => {
	const { user } = await parent();

	const team = await getTeam(name);
	if (!team)
		throw error(404, JSON.stringify({
			error: RequestErrorType.NotFound
		} satisfies RequestError));

	const response = user ? await supabase.from('team_invites').select<string, TeamInvite>('id, author:users!team_invites_author_id_fkey ( name, username, avatar_url )').eq('team_id', team.id).eq('user_id', user.id).limit(1).maybeSingle() : null;
	if (response?.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	return { ...team, invite: response?.data };
}) satisfies PageServerLoad;