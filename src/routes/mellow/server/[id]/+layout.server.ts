import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export const load = async ({ params: { id }, parent }) => {
	const { servers } = await parent();
	if (!servers.some(item => item.id === id))
		throw requestError(401, RequestErrorType.Unauthorised);

	const response = await supabase.from('mellow_servers')
		.select<string, {
			name: string
			avatar_url: string | null
			owner_team: {
				display_name: string
			} | null
			owner_user_id: string
		}>('name, avatar_url, owner_team:teams ( display_name ), owner_user_id')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
};