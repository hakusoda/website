import { z } from 'zod';
import { fail, error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { verifyServerMembership } from '$lib/util/server';
import { getDiscordServerChannels } from '$lib/discord';
import { createMellowServerAuditLog } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { RequestErrorType, MellowServerLogType, MellowServerAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_servers').select<string, {
		logging_types: number
		logging_channel_id: string | null
	}>('logging_types, logging_channel_id').eq('id', id).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({ error: RequestErrorType.ExternalRequestError } satisfies RequestError));
	}

	return {
		...response.data,
		channels: await getDiscordServerChannels(id)
	};
}) satisfies PageServerLoad;

const EDIT_SCHEMA = z.object({
	types: z.number().int().max((Object.values(MellowServerLogType).filter(type => typeof type === 'number') as number[]).reduce((p, v) => p + v, 0)),
	channel: z.string().max(50).nullable()
});

export const actions = {
	edit: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = (await getSession())!;
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
		const response2 = await supabase.from('mellow_servers').update({
			logging_types: data.types,
			logging_channel_id: data.channel
		}).eq('id', id);
		if (response2.error) {
			console.error(response2.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}
	}
} satisfies Actions;