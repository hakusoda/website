import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.rpc('website_get_user_mellow_servers2', {
		target_user_id: session!.sub
	});
	handleResponse(response);

	return {
		servers: (response.data! as { id: string, name: string, avatar_url: string | null }[])
			.sort((a, b) => a.name.localeCompare(b.name))
	};
};