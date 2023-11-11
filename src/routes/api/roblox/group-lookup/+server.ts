import { error } from '@sveltejs/kit';
import { ROBLOX_API } from '@hakumi/roblox-api';

import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { RequestHandler } from './$types';
export const GET = (async ({ url, locals: { session } }) => {
	if (!session)
		throw error(401);

	const body = url.searchParams.get('query');
	if (typeof body !== 'string')
		throw error(400, JSON.stringify({ error: RequestErrorType.InvalidBody } satisfies RequestError));

	const integer = parseInt(body);
	const groups = isNaN(integer) ? await ROBLOX_API.groups.searchExact(body) : await ROBLOX_API.groups.get([integer]);

	const icons = await ROBLOX_API.groups.getIcons(groups.map(group => group.id));
	return new Response(JSON.stringify(groups.map(group => ({
		id: group.id.toString(),
		type: 'roblox',
		name: group.display_name,
		avatar_url: icons.find(i => i.source_id === group.id)?.url
	}))));
}) satisfies RequestHandler;