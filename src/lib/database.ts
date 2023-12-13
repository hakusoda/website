import supabase from './supabase';
import { isUUID, hasBit } from './util';
import { TeamRolePermission } from './enums';
import type { TeamAuditLogType } from './enums';
import type { DatabaseTeam, UserNotification, MellowServerAuditLogType } from './types';
export async function getTeam(teamId: string) {
	let filter = supabase.from('teams').select<string, DatabaseTeam>('id, bio, name, flags, roles:team_roles ( id, name, position, permissions ), owner:users!teams_owner_id_fkey ( id, name, username, avatar_url ), creator:users!teams_creator_id_fkey ( name, username, avatar_url ), members:team_members ( role_id, user:users!team_members_user_id_fkey ( id, bio, name, flags, username, avatar_url, created_at ), joined_at ), avatar_url, website_url, created_at, display_name, affiliations:team_affiliations!team_affiliations_affiliator_id_fkey ( team:teams!team_affiliations_team_id_fkey ( name, avatar_url, display_name ) ), parent_affiliations:team_affiliations!team_affiliations_team_id_fkey ( team:teams!team_affiliations_affiliator_id_fkey ( name, avatar_url, display_name ) )').limit(1);
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
			role: data.roles.find(role => role.id === member.role_id),
			joined_at: member.joined_at
		})).sort((a, b) => (b.role?.position ?? 0) - (a.role?.position ?? 0) || (a.name ?? a.username).localeCompare(b.name ?? b.username))
	};
}

export async function getUserNotifications(userId: string) {
	const { data, error } = await supabase.from('user_notifications')
		.select<string, UserNotification>('id, data, type, state, created_at, target_user:users!user_notifications_target_user_id_fkey ( name, username, avatar_url ), target_team:teams ( name, avatar_url, display_name ), target_profile_post_id')
		.eq('user_id', userId)
		.order('created_at', { ascending: false });
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

export async function hasTeamPermissions(teamId: string, userId: string, permissions: TeamRolePermission[]) {
	const response = await supabase.from('team_members').select<string, {
		role: {
			permissions: number
		} | null
		team: {
			owner_id: string | null
		}
	}>('role:team_roles ( permissions ), team:teams ( owner_id )').eq('user_id', userId).eq('team_id', teamId).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		return false;
	}

	if (!response.data)
		return false;
	if (userId === response.data.team.owner_id)
		return true;

	if (!response.data.role)
		return false;

	if (hasBit(response.data.role.permissions, TeamRolePermission.Administrator))
		return true;
	for (const bit of permissions)
		if (!hasBit(response.data.role.permissions, bit))
			return false;
	return true;
}