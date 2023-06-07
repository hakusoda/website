import supabase from './supabase';
import { isUUID } from './util';
import type { RobloxLinkType } from './enums';
import type { User, Team, RobloxLink, DatabaseTeam } from './types';
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

export async function getUser(userId: string) {
	const { data, error } = await supabase.from('users').select<string, User>('*').eq('id', userId).limit(1).maybeSingle();
	if (error) {
		console.error(error);
		return null;
	}

	if (!data)
		return null;
	return {
		...data,
		avatar_url: supabase.storage.from('avatars').getPublicUrl(`user/${data.id}.png`).data.publicUrl
	};
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

export function getUserAvatar(userId: string) {
	return supabase.storage.from('avatars').getPublicUrl(`user/${userId}.png`).data.publicUrl;
}

export async function getTeam(teamId: string) {
	let filter = supabase.from('teams').select<string, DatabaseTeam>('id, bio, name, flags, members:team_members ( role, user:users ( id, bio, name, flags, username, created_at ), joined_at ), created_at, display_name').limit(1);
	if (isUUID(teamId))
		filter = filter.eq('id', teamId);
	else
		filter = filter.eq('name', teamId);

	const { data, error } = await filter.maybeSingle();
	if (error) {
		console.error(error);
		return null;
	}

	if (!data)
		return null;
	return {
		...data,
		members: data.members.map(member => ({
			...member.user,
			avatar_url: getUserAvatar(member.user.id),
			role: member.role,
			joined_at: member.joined_at
		})).sort((a, b) => b.role - a.role || (a.name ?? a.username).localeCompare(b.name ?? b.username)),
		avatar_url: getTeamAvatar(data.id)
	};
}

export function getTeamAvatar(teamId: string) {
	return supabase.storage.from('avatars').getPublicUrl(`team/${teamId}.png`).data.publicUrl;
}