import { z } from 'zod';

import supabase from '$lib/supabase';
import { verifyServerMembership } from '$lib/util/server';
import { getDiscordServerChannels } from '$lib/discord';
import { requestFail, requestError } from '$lib/util/server';
import { createMellowServerAuditLog } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { RequestErrorType, MellowServerLogType, MellowServerAuditLogType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			logging_types: number
			logging_channel_id: string | null
		}>('logging_types, logging_channel_id')
		.eq('id', id)
		.limit(1)
		.single();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		...response.data,
		channels: getDiscordServerChannels(id)
	};
}) satisfies PageServerLoad;

const EDIT_SCHEMA = z.object({
	types: z.number().int().max((Object.values(MellowServerLogType).filter(type => typeof type === 'number') as number[]).reduce((p, v) => p + v, 0)).optional(),
	channel: z.string().max(50).nullable().optional(),
	channel_name: z.string().max(50).nullable().optional()
});

const filtUndf = (item: any) => item !== undefined;
export const actions = {
	edit: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = (await getSession())!;
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = EDIT_SCHEMA.safeParse(body);
		if (!response.success) {
			console.error(response.error);
			return requestFail(400, RequestErrorType.InvalidBody, response.error.issues);
		}

		const { data } = response;
		const old = await supabase.from('mellow_servers').select('logging_types, logging_channel_id').eq('id', id).single();
		if (old.error) {
			console.error(old.error);
			return requestFail(500, RequestErrorType.ExternalRequestError);
		}

		if (data.types !== undefined || data.channel !== undefined) {
			const response2 = await supabase.from('mellow_servers').update({
				logging_types: data.types,
				logging_channel_id: data.channel
			}).eq('id', id);
			if (response2.error) {
				console.error(response2.error);
				return requestFail(500, RequestErrorType.DatabaseUpdate);
			}

			const oldChannelId = old.data.logging_channel_id;
			await createMellowServerAuditLog(MellowServerAuditLogType.UpdateLogging, session.user.id, id, {
				types: [old.data.logging_types, data.types].filter(filtUndf),
				channel: [oldChannelId ? 'NOT IMPLEMENTED' : null, data.channel_name].filter(filtUndf),
				channel_id: [oldChannelId, data.channel].filter(filtUndf)
			});
		}
	}
} satisfies Actions;