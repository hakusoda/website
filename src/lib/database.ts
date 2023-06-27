import supabase from './supabase';
import { isUUID } from './util';
import type { User, RobloxLink, DatabaseTeam, UserNotification } from './types';
import type { RobloxLinkType, TeamAuditLogType, MellowServerAuditLogType } from './enums';
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
	if (error)
		console.error(error);

	return data;
}

export async function getUsers(userIds: string[]) {
	const { data, error } = await supabase.from('users').select<string, User>('*').in('id', userIds);
	if (error)
		console.error(error);

	return data ?? [];
}

export async function getTeam(teamId: string) {
	let filter = supabase.from('teams').select<string, DatabaseTeam>('id, bio, name, flags, members:team_members ( role, user:users ( id, bio, name, flags, username, avatar_url, created_at ), joined_at ), projects ( id, name, summary, avatar_url, banner_url, created_at, theme_color, display_name, contributors:project_contributors ( id ), external_contributors ), avatar_url, created_at, display_name').limit(1);
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
			role: member.role,
			joined_at: member.joined_at
		})).sort((a, b) => b.role - a.role || (a.name ?? a.username).localeCompare(b.name ?? b.username)),
		projects: data.projects.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
	};
}

export async function getUserNotifications(userId: string) {
	const { data, error } = await supabase.from('user_notifications').select<string, UserNotification>('id, data, type, state, created_at, target_user:users!user_notifications_target_user_id_fkey ( name, username, avatar_url ), target_team:teams ( name, avatar_url, display_name )').eq('user_id', userId).order('created_at', { ascending: false });
	if (error)
		console.error(error);

	return data ?? [];
}

export async function createTeamAuditLog(type: TeamAuditLogType, author_id: string, team_id: string, data?: any) {
	const { error } = await supabase.from('team_audit_logs').insert({
		type,
		data,
		team_id,
		author_id
	});
	if (error)
		console.error(error);
}

export async function createMellowServerAuditLog(type: MellowServerAuditLogType, author_id: string, server_id: string, data?: any, target_link_id?: string) {
	const { error } = await supabase.from('mellow_server_audit_logs').insert({
		type,
		data,
		author_id,
		server_id,
		target_link_id
	});
	if (error)
		console.error(error);
}