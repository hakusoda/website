import * as kit from '@sveltejs/kit';

import { getRobloxGroupRoles } from '$lib/api';
import type { RequestHandler } from './$types';
export const GET = (async ({ url, locals: { getSession } }) => {
	if (!await getSession())
		throw kit.error(401);

	const groupId = url.searchParams.get('id');
	if (typeof groupId !== 'string')
		throw kit.error(400, 'Invalid Request Body');

	return new Response(JSON.stringify(await getRobloxGroupRoles(groupId)));
}) satisfies RequestHandler;