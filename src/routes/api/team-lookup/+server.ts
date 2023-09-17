import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { RequestHandler } from './$types';
export const GET = (async ({ url, locals: { session } }) => {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const body = url.searchParams.get('query');
	if (typeof body !== 'string')
		throw requestError(400, RequestErrorType.InvalidBody);

	const response = await supabase.from('teams')
		.select('id, avatar_url, display_name')
		.textSearch('display_name', body);
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return new Response(JSON.stringify(response.data.map(item => ({
		id: item.id,
		type: 'self',
		name: item.display_name,
		avatar_url: item.avatar_url
	}))));
}) satisfies RequestHandler;