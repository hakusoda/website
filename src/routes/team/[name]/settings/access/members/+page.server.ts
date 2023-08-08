import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name } }) => {
	const response = await supabase.from('teams').select<string, {
		members: {
			role: {
				name: string
				position: number
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
	}>('members:team_members ( role:team_roles ( name, position ), user:users!team_members_user_id_fkey ( name, username, avatar_url ), inviter:users!team_members_inviter_id_fkey ( name, username ), joined_at ), invites:team_invites( user:users!team_invites_user_id_fkey ( name, username, avatar_url ), author:users!team_invites_author_id_fkey ( name, username ), created_at )').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		...response.data,
		members: response.data.members.sort((a, b) => (b.role?.position ?? 0) - (a.role?.position ?? 0) || (a.user.name || a.user.username).localeCompare(b.user.name || b.user.username))
	};
}) satisfies PageServerLoad;

interface PartialUser {
	name: string
	username: string
	avatar_url: string
}