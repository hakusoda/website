import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { LayoutServerLoad } from './$types';
import { verifyServerMembership } from '$lib/util/server';
export const load = (async ({ params: { id }, parent }) => {
	await verifyServerMembership((await parent()).session, id);

	const response = await supabase.from<string, {
		name: string
		avatar_url: string
	}>('mellow_servers').select('name, avatar_url').eq('id', id).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}) satisfies LayoutServerLoad;