import { RequestErrorType } from '$lib/enums';
import type { LayoutServerLoad } from './$types';
import supabase, { handleResponse } from '$lib/supabase';
import { requestError, verifyServerMembership } from '$lib/util/server';
export const load = (async ({ url, params: { id }, locals: { session } }) => {
	await verifyServerMembership(session, id, url);

	const response = await supabase.from('mellow_servers')
		.select('name, avatar_url')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}) satisfies LayoutServerLoad;