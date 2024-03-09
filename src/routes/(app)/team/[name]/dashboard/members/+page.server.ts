import { isUUID } from '$lib/shared/util';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { name } }) {
	const response = await supabase.from('teams').select<string, {
		members: {
			role: {
				id: string
				name: string
				position: number
				permissions: number
			}
			user: PartialUser
			inviter: PartialUser | null
			joined_at: string
		}[]
		invites: {
			user: PartialUser
			author: PartialUser | null
			created_at: string
		}[]
	}>('members:team_members ( role:team_roles ( id, name, position, permissions ), user:users!team_members_user_id_fkey ( id, name, username, avatar_url ), inviter:users!team_members_inviter_id_fkey ( name, username ), joined_at ), invites:team_invites( user:users!team_invites_user_id_fkey ( id, name, username, avatar_url ), author:users!team_invites_author_id_fkey ( name, username ), created_at )').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	handle_response(response);

	return {
		...response.data!,
		members: response.data!.members.sort((a, b) => (b.role?.position ?? 0) - (a.role?.position ?? 0) || (a.user.name || a.user.username).localeCompare(b.user.name || b.user.username))
	};
}

interface PartialUser {
	id: string
	name: string
	username: string
	avatar_url: string
}