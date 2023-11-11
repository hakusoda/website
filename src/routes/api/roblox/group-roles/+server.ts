import { error } from '@sveltejs/kit';
import { ROBLOX_API } from '@hakumi/roblox-api';

import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { RequestHandler } from './$types';
export const GET = (async ({ url, locals: { session } }) => {
	if (!session)
		throw error(401);

	const groupId = url.searchParams.get('id');
	if (typeof groupId !== 'string')
		throw error(400, JSON.stringify({ error: RequestErrorType.InvalidBody } satisfies RequestError));

	return new Response(JSON.stringify(await ROBLOX_API.groups.getRoles(groupId)));
}) satisfies RequestHandler;