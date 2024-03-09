import { redirect } from '@sveltejs/kit';

import { isUUID } from '$lib/shared/util';
import { requestError } from '$lib/server/util';
import { hasTeamPermissions } from '$lib/server/database';
import supabase, { handle_response } from '$lib/server/supabase';
import { RequestErrorType, TeamRolePermission } from '$lib/shared/enums';
export async function load({ url, params: { name }, locals: { session } }) {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const response = await supabase.from('teams').select('id, display_name').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	handle_response(response);

	if (!await hasTeamPermissions(response.data!.id, session.sub, [TeamRolePermission.InviteUsers]))
		throw requestError(403, RequestErrorType.NoPermission);
	return response.data!;
}