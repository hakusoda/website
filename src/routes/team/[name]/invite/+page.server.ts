import { redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { requestError } from '$lib/util/server';
import { hasTeamPermissions } from '$lib/database';
import type { PageServerLoad } from './$types';
import { RequestErrorType, TeamRolePermission } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	if (!session)
		throw redirect(302, '/login');

	const response = await supabase.from('teams').select('id, display_name').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!await hasTeamPermissions(response.data.id, session.user.id, [TeamRolePermission.InviteUsers]))
		throw requestError(403, RequestErrorType.NoPermission);
	return response.data;
}) satisfies PageServerLoad;