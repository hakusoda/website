import { error } from '@sveltejs/kit';

import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import { getRobloxGroupRoles } from '$lib/api';
import type { RequestHandler } from './$types';
export const GET = (async ({ url, locals: { getSession } }) => {
	if (!await getSession())
		throw error(401);

	const groupId = url.searchParams.get('id');
	if (typeof groupId !== 'string')
		throw error(400, JSON.stringify({ error: RequestErrorType.InvalidBody } satisfies RequestError));

	return new Response(JSON.stringify(await getRobloxGroupRoles(groupId)));
}) satisfies RequestHandler;