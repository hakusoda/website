import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	
	const response = await supabase.from('user_devices')
		.select('id, name, user_os, user_country, user_platform')
		.eq('user_id', session!.sub);
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return { devices: response.data };
}) satisfies PageServerLoad;