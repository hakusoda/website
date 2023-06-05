import supabase from './supabase';
import { isUUID } from './util';
import type { RobloxLinkType } from './enums';
import type { User, Team, RobloxLink } from './types';
export function getUserRobloxLinks(userId: string, linkType?: RobloxLinkType) {
	const filter = supabase.from('roblox_links').select<string, RobloxLink>('*').eq('owner', userId);
	if (linkType !== undefined)
		filter.eq('type', linkType);
	return filter.then(response => {
		if (response.error)
			return [];
		return response.data;
	});
}

export async function getUsers(userIds: string[]) {
	const { data, error } = await supabase.from('users').select<string, User>('*').in('id', userIds);
	if (error) {
		console.error(error);
		return [];
	}

	return data.map(user => ({
		...user,
		avatar_url: supabase.storage.from('avatars').getPublicUrl(`user/${user.id}.png`).data.publicUrl
	}));
}

export async function getTeam(teamId: string) {
	const filter = supabase.from('teams').select<string, Team>('*');
	if (isUUID(teamId))
		filter.eq('id', teamId);
	else
		filter.eq('name', teamId);

	const { data, error } = await filter;
	if (error) {
		console.error(error);
		return null;
	}

	const team = data[0];
	if (!team)
		return null;

	return {
		...team,
		avatar_url: supabase.storage.from('avatars').getPublicUrl(`team/${team.id}.png`).data.publicUrl
	};
}