import { z } from 'zod';
import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { verifyServerMembership } from '$lib/util/server';
import { createMellowServerAuditLog } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { RequestErrorType, MellowServerAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const { data, error } = await supabase.from('mellow_servers').select<string, {
		default_nickname: string
	}>('default_nickname').eq('id', id).limit(1).single();
	if (error) {
		console.error(error);
		throw kit.error(500, JSON.stringify({ error: RequestErrorType.ExternalRequestError } satisfies RequestError));
	}

	if (!data)
		throw kit.error(404, JSON.stringify({ error: RequestErrorType.NotFound } satisfies RequestError));

	return data;
}) satisfies PageServerLoad;

const EDIT_SCHEMA = z.object({
	defaultNickname: z.string().max(32)
});

export const actions = {
	edit: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = (await getSession())!;
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = EDIT_SCHEMA.safeParse(body);
		if (!response.success) {
			console.error(response.error);
			return kit.fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: response.error.issues
			} satisfies RequestError);
		}

		const { data } = response;
		const response2 = await supabase.from('mellow_servers').update({
			default_nickname: data.defaultNickname
		}).eq('id', id);
		if (response2.error) {
			console.error(response2.error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		await createMellowServerAuditLog(MellowServerAuditLogType.UpdateRobloxGlobalSettings, session.user.id, id, {
			default_nickname: ['NOT IMPLEMENTED', data.defaultNickname]
		});
	}
} satisfies Actions;