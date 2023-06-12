import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { TeamRole } from '$lib/enums';
import type { PageServerLoad } from './$types';
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