import { z } from 'zod';
import { fail, error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { createMellowServerAuditLog } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { requestError, verifyServerMembership } from '$lib/util/server';
import { RequestErrorType, MellowServerAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_servers').select<string, {
		default_nickname: string
		sync_unknown_users: boolean
		allow_forced_syncing: boolean
	}>('default_nickname, sync_unknown_users, allow_forced_syncing').eq('id', id).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({ error: RequestErrorType.ExternalRequestError } satisfies RequestError));
	}

	if (!response.data)
		throw error(404, JSON.stringify({ error: RequestErrorType.NotFound } satisfies RequestError));

	return response.data;
}) satisfies PageServerLoad;

const EDIT_SCHEMA = z.object({
	defaultNickname: z.string().max(32).optional(),
	syncUnknownUsers: z.boolean().optional(),
	allowForcedSyncing: z.boolean().optional()
});

export const actions = {
	edit: async ({ locals: { session }, params: { id }, request }) => {
		if (!session)
			throw requestError(401, RequestErrorType.Unauthenticated);
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = EDIT_SCHEMA.safeParse(body);
		if (!response.success) {
			console.error(response.error);
			return fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: response.error.issues
			} satisfies RequestError);
		}

		const { data } = response;
		const response2 = await supabase.from('mellow_servers').select('default_nickname, sync_unknown_users, allow_forced_syncing').eq('id', id).limit(1).single();
		if (response2.error) {
			console.error(response2.error);
			return fail(500, { error: RequestErrorType.ExternalRequestError } satisfies RequestError);
		}

		const response3 = await supabase.from('mellow_servers').update({
			default_nickname: data.defaultNickname,
			sync_unknown_users: data.syncUnknownUsers,
			allow_forced_syncing: data.allowForcedSyncing
		}).eq('id', id);
		if (response3.error) {
			console.error(response3.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		await createMellowServerAuditLog(MellowServerAuditLogType.UpdateRobloxGlobalSettings, session.sub, id, {
			default_nickname: [response2.data.default_nickname, data.defaultNickname],
			sync_unknown_users: [response2.data.sync_unknown_users, data.syncUnknownUsers],
			allow_forced_syncing: [response2.data.allow_forced_syncing, data.allowForcedSyncing]
		});
	}
} satisfies Actions;