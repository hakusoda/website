import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_server_webhooks')
		.select<string, {
			id: string
			name: string
			events: number
			enabled: boolean
			creator: {
				name: string | null
				username: string
			} | null
			target_url: string
			created_at: string
			request_method: string
		}>('id, name, events, creator:users ( name, username ), enabled, target_url, created_at, request_method')
		.eq('server_id', id);
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		webhooks: response.data
	};
}) satisfies PageServerLoad;