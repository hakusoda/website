import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import supabase from '$lib/supabase';
import { RequestErrorType } from '$lib/enums';
import { getDiscordServerMembers } from '$lib/discord';
import { requestError, verifyServerMembership } from '$lib/util/server';
export const GET = (async ({ params, locals: { session } }) => {
	await verifyServerMembership(session, params.id);

	const members = await getDiscordServerMembers(params.id, 1000);
	if (!members.length)
		return json([]);

	const response = await supabase.from('user_connections').select<string, {
		sub: string
		user: {
			links: {
				id: string
				target_id: string
			}[]
			primary_roblox_link_id: string | null
		}
	}>('sub, user:users ( links:roblox_links!roblox_links_owner_id_fkey ( id, target_id ), primary_roblox_link_id )').in('sub', members.map(member => member.user.id));
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return json(members.map(member => {
		const connection = response.data.find(item => item.sub === member.user.id);
		return {
			...member,
			primary_roblox_link: connection?.user.links.find(link => link.id === connection.user.primary_roblox_link_id)?.target_id ?? connection?.user.links[0]?.target_id
		};
	}));
}) satisfies RequestHandler;