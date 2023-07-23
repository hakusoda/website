import { error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	const response = await supabase.from('team_members').select('team:teams ( name, members:team_members ( count ), avatar_url, display_name )').eq('user_id', session!.user.id);
	if (response.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	console.log(response.data);
	return { teams: response.data.map(item => item.team) };
}) satisfies PageServerLoad;