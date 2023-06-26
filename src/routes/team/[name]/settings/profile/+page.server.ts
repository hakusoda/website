import { z } from 'zod';
import { fail } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { Actions } from './$types';
import { USERNAME_REGEX } from '$lib/constants';
import type { RequestError } from '$lib/types';
import { createTeamAuditLog } from '$lib/database';
import { RequestErrorType, TeamAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };

const EDIT_PROFILE_SCHEMA = z.object({
	name: z.string().regex(USERNAME_REGEX).min(3).max(20)
});

export const actions = {
	edit: async ({ params: { name }, locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const response = await supabase.from('team_members').select<string, { team: { id: string, name: string } }>('team:teams!inner( id, name )').eq('user_id', session.user.id).eq(isUUID(name) ? 'team.id' : 'team.name', name).gte('role', 200).limit(1).maybeSingle();
		if (response.error) {
			console.error(response.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}
		if (!response.data)
			return fail(403, { error: RequestErrorType.Unauthorised } satisfies RequestError);

		const data = EDIT_PROFILE_SCHEMA.safeParse(await request.json());
		if (!data.success) {
			console.error(data.error);
			return fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: data.error.issues
			} satisfies RequestError);
		}

		const response2 = await supabase.from('teams').update({
			name: data.data.name
		}).eq(isUUID(name) ? 'id' : 'name', name);
		if (response2.error) {
			console.error(response2.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		await createTeamAuditLog(TeamAuditLogType.RenameTeam, session.user.id, response.data.team.id, [response.data.team.name, data.data.name])
		return {};
	}
} satisfies Actions;