import { requestError } from '$lib/server/util';
import { RequestErrorType } from '$lib/shared/enums';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ locals: { session } }) {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.rpc('website_get_user_mellow_servers2', {
		target_user_id: session!.sub
	});
	handle_response(response);

	return {
		servers: (response.data! as { id: string, name: string, avatar_url: string | null }[])
			.sort((a, b) => a.name.localeCompare(b.name))
	};
};