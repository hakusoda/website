import { z } from 'zod';

import { getDiscordServerChannels } from '$lib/server/discord';
import supabase, { handle_response } from '$lib/server/supabase';
import { createMellowServerAuditLog } from '$lib/server/database';
import { RequestErrorType, MellowServerLogType } from '$lib/shared/enums';
import { requestFail, requestError, verify_mellow_server_access } from '$lib/server/util';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			logging_types: number
			logging_channel_id: string | null
		}>('logging_types, logging_channel_id')
		.eq('id', id)
		.limit(1)
		.single();
	handle_response(response);

	return {
		...response.data!,
		channels: await getDiscordServerChannels(id)
	};
}

const EDIT_SCHEMA = z.object({
	types: z.number().int().max((Object.values(MellowServerLogType).filter(type => typeof type === 'number') as number[]).reduce((p, v) => p + v, 0)).optional(),
	channel: z.string().max(50).nullable().optional(),
	channel_name: z.string().max(50).nullable().optional()
});

const filtUndf = (item: any) => item !== undefined;
export const actions = {
	edit: async ({ url, locals: { session }, params: { id }, request }) => {
		if (!session)
			throw requestError(401, RequestErrorType.Unauthenticated);
		await verify_mellow_server_access(session, id, url);

		const body = await request.json();
		const response = EDIT_SCHEMA.safeParse(body);
		if (!response.success) {
			console.error(response.error);
			return requestFail(400, RequestErrorType.InvalidBody, response.error.issues);
		}

		const { data } = response;
		const old = await supabase.from('mellow_servers')
			.select('logging_types, logging_channel_id')
			.eq('id', id)
			.single();
		handle_response(old);

		if (data.types !== undefined || data.channel !== undefined) {
			handle_response(await supabase.from('mellow_servers')
				.update({
					logging_types: data.types,
					logging_channel_id: data.channel
				})
				.eq('id', id)
			);

			const oldChannelId = old.data!.logging_channel_id;
			await createMellowServerAuditLog('mellow.server.discord_logging.updated', session.sub, id, {
				types: [old.data!.logging_types, data.types].filter(filtUndf),
				channel: [oldChannelId ? 'NOT IMPLEMENTED' : null, data.channel_name].filter(filtUndf),
				channel_id: [oldChannelId, data.channel].filter(filtUndf)
			});
		}
	}
}