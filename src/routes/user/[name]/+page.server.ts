import { z } from 'zod';
import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { RequestError } from '$lib/types';
import { DISPLAY_NAME_REGEX } from '$lib/constants';
import type { Actions, PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
import { TeamRole, RequestErrorType, UserNotificationType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	const { data, error } = await supabase.from('users').select<string, {
		id: string
		bio: string | null
		name: string | null
		flags: number
		teams: {
			role: TeamRole
			team: {
				id: string
				name: string
				members: { id: string }[]
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
	}>('id, bio, name, flags, username, avatar_url, created_at, teams:team_members!team_members_user_id_fkey ( role, team:teams ( id, name, avatar_url, display_name, members:team_members ( id ) ) ), team_invites!team_invites_user_id_fkey ( team_id ), roblox_links!roblox_links_owner_fkey ( target_id ), burger:user_notifications!user_notifications_user_id_fkey ( type )').eq(isUUID(name) ? 'id' : 'username', name).eq('roblox_links.public', true).gte('roblox_links.flags', 2).eq('user_notifications.target_user_id', session?.user.id).eq('user_notifications.type', UserNotificationType.SOMETHING).limit(1).maybeSingle();
	if (error) {
		console.error(error);
		throw kit.error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	if (!data)
		throw kit.error(404, JSON.stringify({
			error: RequestErrorType.NotFound
		} satisfies RequestError));

	const myTeams = session ? await supabase.from('team_members').select<string, {
		team: {
			id: string
			avatar_url: string
			display_name: string
		}
	}>('role, team:teams ( id, avatar_url, display_name )').gte('role', 200).eq('user_id', session.user.id) : null;
	if (myTeams?.error) {
		console.error(myTeams.error);
		throw kit.error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	const robloxUsers = await getRobloxUsers(data.roblox_links.map(l => l.target_id));
	const robloxIcons = await getRobloxAvatars(robloxUsers.map(l => l.id));

	const teams = data.teams.map(team => ({
		role: team.role,
		...team.team
	})).sort((a, b) => a.display_name.localeCompare(b.display_name));
	const my_teams = myTeams?.data?.map(item => item.team).sort((a, b) => a.display_name.localeCompare(b.display_name)) || [];
	const team_invites = data.team_invites.filter(invite => my_teams.some(team => team.id === invite.team_id));
	return {
		...data,
		teams,
		my_teams: my_teams.filter(item => !teams.some(team => team.id === item.id) && !team_invites.some(invite => invite.team_id === item.id)),
		team_invites,
		roblox_users: robloxUsers.map((user, index) => ({
			...user,
			icon: robloxIcons[index]
		}))
	};
}) satisfies PageServerLoad;

const EDIT_PROFILE_SCHEMA = z.object({
	bio: z.string().max(200).nullable().optional(),
	name: z.string().regex(DISPLAY_NAME_REGEX).min(3).max(20).nullable().optional()
});

export const actions = {
	edit: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return kit.fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const data = EDIT_PROFILE_SCHEMA.safeParse(await request.json());
		if (!data.success) {
			console.error(data.error);
			return kit.fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: data.error.issues
			} satisfies RequestError);
		}

		const { error } = await supabase.from('users').update(data.data).eq('id', session.user.id);
		if (error) {
			console.error(error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	},
	burger: async ({ locals: { getSession }, params: { name } }) => {
		const session = await getSession();
		if (!session)
			return kit.fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const response = await supabase.from('users').select('id').eq(isUUID(name) ? 'id' : 'username', name).limit(1).single();
		if (response.error) {
			console.error(response.error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		const { error } = await supabase.from('user_notifications').upsert({
			type: UserNotificationType.SOMETHING,
			user_id: response.data.id,
			target_user_id: session.user.id
		});
		if (error) {
			console.error(error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	}
} satisfies Actions;