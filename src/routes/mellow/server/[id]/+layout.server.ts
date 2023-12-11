import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export const load = async ({ params: { id }, parent }) => {
	const { servers } = await parent();
	if (!servers.some(item => item.id === id))
		throw requestError(401, RequestErrorType.Unauthorised);

	const response = await supabase.from('mellow_servers')
		.select('name, avatar_url')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
};