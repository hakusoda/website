import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	
	const response = await supabase.from('users').select('name, username, avatar_url, created_at').eq('id', session!.sub).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return response.data;
}) satisfies PageServerLoad;