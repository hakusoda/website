import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import type { PageServerLoad } from './$types';
import { RequestErrorType, UserConnectionType } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	const response = await supabase.from('user_connections').select<string, {
		id: string
		sub: string
		name: string
		type: UserConnectionType
		metadata: any
		created_at: string
	}>('id, sub, name, type, metadata, created_at').eq('user_id', session!.sub);
	if (response.error) { 
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return { connections: response.data };
}) satisfies PageServerLoad;