import * as kit from '@sveltejs/kit';

import type { RequestHandler } from './$types';
import { lookupRobloxGroups, getRobloxGroupAvatars } from '$lib/api';
export const GET = (async ({ url, locals: { getSession } }) => {
	if (!await getSession())
		throw kit.error(401);

	const body = url.searchParams.get('query');
	if (typeof body !== 'string')
		throw kit.error(400, 'Invalid Request Body');

	const groups = await lookupRobloxGroups(body);
	const icons = await getRobloxGroupAvatars(groups.map(group => group.id));
	return new Response(JSON.stringify(groups.map(group => ({
		...group,
		icon: icons.find(i => i.targetId === group.id)?.imageUrl
	}))));
}) satisfies RequestHandler;