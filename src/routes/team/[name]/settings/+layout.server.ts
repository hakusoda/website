import { error, redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { LayoutServerLoad } from './$types';
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	if (!session)
		throw redirect(302, '/login');

	const response = await supabase.from('teams').select<string, {
		name: string
		members: {
			id: string
			role: number
		}[]
		avatar_url: string
		created_at: string
		display_name: string
	}>('name, avatar_url, created_at, display_name, members:team_members( id:user_id, role )').eq(isUUID(name) ? 'id' : 'name', name).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	if (!response.data.members.some(member => member.id === session.user.id && member.role >= 200))
		throw error(403, JSON.stringify({
			error: RequestErrorType.Unauthorised
		} satisfies RequestError));
	return response.data;
}) satisfies LayoutServerLoad;