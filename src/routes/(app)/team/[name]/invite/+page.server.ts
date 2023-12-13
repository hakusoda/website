import { redirect } from '@sveltejs/kit';

import { isUUID } from '$lib/util';
import { requestError } from '$lib/util/server';
import { hasTeamPermissions } from '$lib/database';
import supabase, { handleResponse } from '$lib/supabase';
import { RequestErrorType, TeamRolePermission } from '$lib/enums';
export async function load({ url, params: { name }, locals: { session } }) {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const response = await supabase.from('teams').select('id, display_name').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	handleResponse(response);

	if (!await hasTeamPermissions(response.data!.id, session.sub, [TeamRolePermission.InviteUsers]))
		throw requestError(403, RequestErrorType.NoPermission);
	return response.data;
}