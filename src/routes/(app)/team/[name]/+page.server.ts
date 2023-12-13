import supabase from '$lib/supabase';
import { getTeam } from '$lib/database';
import { requestError } from '$lib/util/server';
import type { TeamInvite } from '$lib/types';
import { RequestErrorType } from '$lib/enums';
export async function load({ params: { name }, parent }) {
	const { user } = await parent();

	const team = await getTeam(name);
	if (!team)
		throw requestError(404, RequestErrorType.NotFound);

	const response = user ? await supabase.from('team_invites').select<string, TeamInvite>('id, author:users!team_invites_author_id_fkey ( name, username, avatar_url )').eq('team_id', team.id).eq('user_id', user.id).limit(1).maybeSingle() : null;
	if (response?.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return { ...team, invite: response?.data };
}