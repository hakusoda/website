import { requestError } from '$lib/util/server';
import type { PageServerLoad } from './$types';
import supabase, { handleResponse } from '$lib/supabase';
import { RequestErrorType, UserConnectionType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			default_nickname: string
			skip_onboarding_to: UserConnectionType | null
			allow_forced_syncing: boolean
		}>('default_nickname, skip_onboarding_to, allow_forced_syncing')
		.eq('id', id)
		.limit(1)
		.single();
	handleResponse(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}) satisfies PageServerLoad;