import { error } from '@sveltejs/kit';

import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { RequestHandler } from './$types';
import { getRobloxGroups, lookupRobloxGroups, getRobloxGroupAvatars } from '$lib/api';
export const GET = (async ({ url, locals: { getSession } }) => {
	if (!await getSession())
		throw error(401);

	const body = url.searchParams.get('query');
	if (typeof body !== 'string')
		throw error(400, JSON.stringify({ error: RequestErrorType.InvalidBody } satisfies RequestError));

	const integer = parseInt(body);
	const groups = isNaN(integer) ? await lookupRobloxGroups(body) : await getRobloxGroups([integer]);

	const icons = await getRobloxGroupAvatars(groups.map(group => group.id));
	return new Response(JSON.stringify(groups.map(group => ({
		id: group.id.toString(),
		type: 'roblox',
		name: group.name,
		avatar_url: icons.find(i => i.targetId === group.id)?.imageUrl
	}))));
}) satisfies RequestHandler;