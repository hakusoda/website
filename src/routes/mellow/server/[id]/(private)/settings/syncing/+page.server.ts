import { requestError } from '$lib/server/util';
import supabase, { handle_response } from '$lib/server/supabase';
import { RequestErrorType, UserConnectionType } from '$lib/shared/enums';
export async function load({ params: { id } }) {
	const response = await supabase.from('mellow_servers')
		.select<string, {
			default_nickname: string
			skip_onboarding_to: UserConnectionType | null
			allow_forced_syncing: boolean
			oauth_authorisations: { kind: number }[]
		}>('default_nickname, skip_onboarding_to, allow_forced_syncing, oauth_authorisations:mellow_server_oauth_authorisations (kind)')
		.eq('id', id)
		.limit(1)
		.single();
	handle_response(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}