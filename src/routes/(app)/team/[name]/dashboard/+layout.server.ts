import { redirect } from '@sveltejs/kit';

import { requestError } from '$lib/server/util';
import { isUUID, hasBit } from '$lib/shared/util';
import type { LayoutServerLoad } from './$types';
import supabase, { handle_response } from '$lib/server/supabase';
import { RequestErrorType, TeamRolePermission } from '$lib/shared/enums';
export const load = (async ({ url, params: { name }, locals: { session } }) => {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const response = await supabase.from('teams')
		.select<string, {
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
					position: number
					permissions: number
				}
			}[]
			owner_id: string | null
			created_at: string
			avatar_url: string | null
			website_url: string | null
			display_name: string
		}>('id, bio, name, roles:team_roles ( id, name, creator:users ( name, username ), position, created_at, permissions ), owner_id, avatar_url, created_at, website_url, display_name, members:team_members( id:user_id, role:team_roles!team_members_role_id_fkey ( position, permissions ) )')
		.eq(isUUID(name) ? 'id' : 'name', name)
		.order('position', { ascending: false, referencedTable: 'team_roles' })
		.limit(1)
		.maybeSingle();
	handle_response(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	if (session.sub !== response.data.owner_id && !response.data.members.some(member => member.id === session.sub && (hasBit(member.role.permissions, TeamRolePermission.ManageTeam) || hasBit(member.role.permissions, TeamRolePermission.Administrator))))
		throw requestError(403, RequestErrorType.Unauthorised);
	return response.data;
}) satisfies LayoutServerLoad;