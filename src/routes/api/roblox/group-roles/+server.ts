import { error } from '@sveltejs/kit';

import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { RequestHandler } from './$types';
import { getRobloxGroupRoles } from '$lib/roblox';
export const GET = (async ({ url, locals: { session } }) => {
	if (!session)
		throw error(401);

	const groupId = url.searchParams.get('id');
	if (typeof groupId !== 'string')
		throw error(400, JSON.stringify({ error: RequestErrorType.InvalidBody } satisfies RequestError));

	return new Response(JSON.stringify(await getRobloxGroupRoles(groupId)));
}) satisfies RequestHandler;