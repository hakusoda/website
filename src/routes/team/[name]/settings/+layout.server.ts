import { redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { isUUID, hasBit } from '$lib/util';
import type { LayoutServerLoad } from './$types';
import { RequestErrorType, TeamRolePermission } from '$lib/enums';
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	if (!session)
		throw redirect(302, '/sign-in');

	const response = await supabase.from('teams').select<string, {
		id: string
		bio: string | null
		name: string
		roles: {
			id: string
			name: string
			creator: {
				name: string | null
				username: string
			} | null
			position: number
			created_at: string
			permissions: number
		}[]
		members: {
			id: string
			role: {
				permissions: number
			}
		}[]
		owner_id: string | null
		created_at: string
		avatar_url: string | null
		website_url: string | null
		display_name: string
	}>('id, bio, name, roles:team_roles ( id, name, creator:users ( name, username ), position, created_at, permissions ), owner_id, avatar_url, created_at, website_url, display_name, members:team_members( id:user_id, role:team_roles ( permissions ) )').eq(isUUID(name) ? 'id' : 'name', name).order('position', { ascending: false, foreignTable: 'team_roles' }).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	if (session.sub !== response.data.owner_id && !response.data.members.some(member => member.id === session.sub && hasBit(member.role.permissions, TeamRolePermission.ManageTeam)))
		throw requestError(403, RequestErrorType.Unauthorised);
	return response.data;
}) satisfies LayoutServerLoad;