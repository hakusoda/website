import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { EMPTY_UUID } from '$lib/constants';
import { requestFail, requestError } from '$lib/util/server';
import type { Actions, PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
import { RequestErrorType, UserNotificationType } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	const response = await supabase.from('users').select<string, {
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
		burger: {
			type: UserNotificationType
		}[]
		username: string
		avatar_url: string
		created_at: string
		team_invites: {
			team_id: string
		}[]
		roblox_links: {
			target_id: number
		}[]
	}>('id, bio, name, flags, username, avatar_url, created_at, teams:team_members!team_members_user_id_fkey ( role:team_roles ( name ), team:teams ( id, name, flags, owner:users!teams_owner_id_fkey ( name, username ), avatar_url, display_name, members:team_members ( count ) ) ), team_invites!team_invites_user_id_fkey ( team_id ), roblox_links!roblox_links_owner_fkey ( target_id ), burger:user_notifications!user_notifications_user_id_fkey ( type )').eq(isUUID(name) ? 'id' : 'username', name).eq('roblox_links.public', true).gte('roblox_links.flags', 2).eq('user_notifications.target_user_id', session?.user.id ?? EMPTY_UUID).eq('user_notifications.type', UserNotificationType.SOMETHING).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	const myTeams = session ? await supabase.from('team_members').select<string, {
		team: {
			id: string
			avatar_url: string
			display_name: string
		}
	}>('team:teams ( id, avatar_url, display_name )').eq('user_id', session.user.id) : null;
	if (myTeams?.error) {
		console.error(myTeams.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	const robloxUsers = await getRobloxUsers(response.data.roblox_links.map(l => l.target_id));
	const robloxIcons = await getRobloxAvatars(robloxUsers.map(l => l.id));

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
		team_invites,
		roblox_users: robloxUsers.map((user, index) => ({
			...user,
			icon: robloxIcons[index]
		}))
	};
}) satisfies PageServerLoad;

export const actions = {
	burger: async ({ locals: { getSession }, params: { name } }) => {
		const session = await getSession();
		if (!session)
			return requestFail(401, RequestErrorType.Unauthenticated);

		const response = await supabase.from('users').select('id').eq(isUUID(name) ? 'id' : 'username', name).limit(1).single();
		if (response.error) {
			console.error(response.error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		const { error } = await supabase.from('user_notifications').upsert({
			type: UserNotificationType.SOMETHING,
			user_id: response.data.id,
			target_user_id: session.user.id
		});
		if (error) {
			console.error(error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		return {};
	}
} satisfies Actions;