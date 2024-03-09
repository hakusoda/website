import { isUUID } from '$lib/shared/util';
import { EMPTY_UUID } from '$lib/shared/constants';
import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { name }, locals: { session } }) {
	const filter = supabase.from('users')
		.select<string, {
			id: string
			bio: string | null
			name: string | null
			flags: number
			teams: {
				role: {
					name: string
				} | null
				team: {
					id: string
					name: string
					flags: number
					owner: {
						name: string | null
						username: string
					} | null
					members: [{ count: number }]
					avatar_url: string
					display_name: string
				}
			}[]
			username: string
			is_edited: boolean
			following: [{ count: number }]
			followers: [{ count: number }]
			avatar_url: string
			created_at: string
			team_invites: {
				team_id: string
			}[]
		}>(`id, bio, name, flags, username, is_edited, following:user_followers!user_followers_target_user_id_fkey ( count ), followers:user_followers!user_followers_target_user_id_fkey ( count ), avatar_url, created_at, teams:team_members!team_members_user_id_fkey ( role:team_roles ( name ), team:teams ( id, name, flags, owner:users!teams_owner_id_fkey ( name, username ), avatar_url, display_name, members:team_members ( count ) ) ), team_invites!team_invites_user_id_fkey ( team_id )`)
		.eq(isUUID(name) ? 'id' : 'username', name)
		.eq('following.user_id', session?.sub ?? EMPTY_UUID);
		
	const response = await filter
		.limit(1)
		.maybeSingle();
	handle_response(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	const myTeams = session ? handle_response(await supabase.from('team_members').select<string, {
		team: {
			id: string
			avatar_url: string
			display_name: string
		}
	}>('team:teams ( id, avatar_url, display_name )').eq('user_id', session.sub)) : null;

	const teams = response.data.teams.map(team => ({
		role: team.role,
		...team.team
	})).sort((a, b) => a.display_name.localeCompare(b.display_name));
	const my_teams = myTeams?.data?.map(item => item.team).sort((a, b) => a.display_name.localeCompare(b.display_name)) || [];
	const team_invites = response.data.team_invites.filter(invite => my_teams.some(team => team.id === invite.team_id));
	return {
		...response.data,
		teams,
		my_teams: my_teams.filter(item => !teams.some(team => team.id === item.id) && !team_invites.some(invite => invite.team_id === item.id)),
		team_invites
	};
}