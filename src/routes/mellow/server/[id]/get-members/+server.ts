import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import supabase from '$lib/supabase';
import { RequestErrorType } from '$lib/enums';
import { getDiscordServerMembers } from '$lib/discord';
import { requestError, verifyServerMembership } from '$lib/util/server';
export const GET = (async ({ url, params, locals: { session } }) => {
	await verifyServerMembership(session, params.id, url);

	const members = await getDiscordServerMembers(params.id, 1000);
	if (!members.length)
		return json([]);

	const response = await supabase.from('user_connections')
		.select<string, {
			sub: string
		}>('sub')
		.in('sub', members.map(member => member.user.id));
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return json(members);
}) satisfies RequestHandler;