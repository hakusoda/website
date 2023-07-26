import { fail, error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { getDiscordToken } from '$lib/verification';
import type { RequestError } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';
import { RequestErrorType, UserConnectionType } from '$lib/enums';
import { isUUID, createUserConnectionsDiscordRedirectUrl } from '$lib/util';
export const config = { regions: ['iad1'] };
export const load = (async ({ url, parent }) => {
	const { session } = await parent();
	const code = url.searchParams.get('code');
	if (code && session) {
		const response = await getDiscordToken(code, createUserConnectionsDiscordRedirectUrl(url.origin));
		if (!response.success) {
			console.error(response.error);
			throw error(500, JSON.stringify({ error: RequestErrorType.ExternalRequestError } satisfies RequestError));
		}

		const response2 = await fetch('https://discord.com/api/v10/users/@me', {
			headers: {
				authorization: `${response.data.token_type} ${response.data.access_token}`
			}
		}).then(response => response.json());
		const response3 = await supabase.from('user_connections').insert({
			sub: response2.id,
			type: UserConnectionType.Discord,
			name: `${response2.global_name} (@${response2.username})`,
			user_id: session.user.id,
			metadata: response2
		});
		if (response3.error) {
			console.error(response3.error);
			throw error(500, JSON.stringify({ error: RequestErrorType.ExternalRequestError } satisfies RequestError));
		}
	}

	const response = await supabase.from('user_connections').select<string, {
		id: string
		sub: string
		name: string
		type: UserConnectionType
		metadata: any
	}>('id, sub, name, type, metadata').eq('user_id', session!.user.id);
	if (response.error) { 
		console.error(response.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	return { connections: response.data };
}) satisfies PageServerLoad;

export const actions = {
	remove: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const id = await request.text();
		if (!isUUID(id))
			return fail(400, { error: RequestErrorType.InvalidBody } satisfies RequestError);

		const response = await supabase.from('user_connections').delete().eq('id', id).eq('user_id', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	}
} satisfies Actions;