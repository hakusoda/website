import { z } from 'zod';
import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { RequestError } from '$lib/types';
import { DISPLAY_NAME_REGEX } from '$lib/constants';
import { TeamRole, RequestErrorType } from '$lib/enums';
import type { Actions, PageServerLoad } from './$types';
import { getUserAvatar, getTeamAvatar } from '$lib/database';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name } }) => {
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
				display_name: string
			}
		}[]
		username: string
		created_at: string
		roblox_links: {
			target_id: number
		}[]
	}>('id, bio, name, flags, username, created_at, teams:team_members ( role, team:teams ( id, name, display_name, members:team_members ( id ) ) ), roblox_links ( target_id )').eq(isUUID(name) ? 'id' : 'username', name).eq('roblox_links.public', true).gte('roblox_links.flags', 2).limit(1).maybeSingle();
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(404);

	const robloxUsers = await getRobloxUsers(data.roblox_links.map(l => l.target_id));
	const robloxIcons = await getRobloxAvatars(robloxUsers.map(l => l.id));
	return {
		...data,
		teams: data.teams.map(team => ({
			role: team.role,
			...team.team,
			avatar_url: getTeamAvatar(team.team.id)
		})).sort((a, b) => a.display_name.localeCompare(b.display_name)),
		avatar_url: getUserAvatar(data.id),
		roblox_users: robloxUsers.map((user, index) => ({
			...user,
			icon: robloxIcons[index]
		}))
	};
}) satisfies PageServerLoad;

const EDIT_PROFILE_SCHEMA = z.object({
	bio: z.string().max(200).nullable(),
	name: z.string().regex(DISPLAY_NAME_REGEX).nullable()
});

export const actions = {
	edit: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return kit.fail(401, { error_id: RequestErrorType.Unauthenticated } satisfies RequestError);

		const data = EDIT_PROFILE_SCHEMA.safeParse(await request.json());
		if (!data.success) {
			console.error(data.error);
			return kit.fail(400, {
				error_id: RequestErrorType.InvalidBody,
				zod_issues: data.error.issues
			} satisfies RequestError);
		}

		const { error } = await supabase.from('users').update(data.data).eq('id', session.user.id);
		if (error) {
			console.error(error);
			return kit.fail(500, { error_id: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	}
} satisfies Actions;