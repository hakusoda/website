import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { LayoutServerLoad } from './$types';
import { verifyServerMembership } from '$lib/util/server';
export const load = (async ({ url, params: { id }, locals: { session } }) => {
	await verifyServerMembership(session, id, url);

	const response = await supabase.from('mellow_servers').select('name, avatar_url').eq('id', id).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}) satisfies LayoutServerLoad;