import type { PageServerLoad } from './$types';
import type { UserConnectionType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	const response = await supabase.from('user_connections').select<string, {
		id: string
		sub: string
		type: UserConnectionType
		metadata: any
		created_at: string
	}>('id, sub, type, metadata, created_at').eq('user_id', session!.sub);
	handleResponse(response);

	return { connections: response.data! };
}) satisfies PageServerLoad;