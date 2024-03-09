import { redirect } from '@sveltejs/kit';

import { MELLOW_KEY } from '$env/static/private';
import { requestError } from '$lib/server/util';
import { getDiscordServer } from '$lib/server/discord';
import { getUserConnectionUrl } from '$lib/shared/util';
import supabase, { handle_response } from '$lib/server/supabase';
import { MELLOW_SYNC_REQUIREMENT_CONNECTIONS } from '$lib/shared/constants';
import { RequestErrorType, UserConnectionType, MellowProfileSyncActionRequirementType } from '$lib/shared/enums';
export const load = async ({ url, params: { id }, locals: { session } }) => {
	if (!session)
		throw requestError(401, RequestErrorType.Unauthenticated);

	const response = await supabase.from('mellow_servers')
		.select<string, {
			name: string
			avatar_url: string | null
			actions: {
				requirements: {
					type: MellowProfileSyncActionRequirementType
				}[]
			}[]
			skip_onboarding_to: UserConnectionType | null
		}>('name, avatar_url, actions:mellow_binds ( requirements:mellow_bind_requirements ( type ) ), skip_onboarding_to')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handle_response(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	const { actions, skip_onboarding_to, ...data } = response.data;
	if (skip_onboarding_to !== null && url.searchParams.get('done') !== '')
		throw redirect(302, getUserConnectionUrl(skip_onboarding_to) + `&state=mellow_onboarding_${id}`);

	const connections: { type: UserConnectionType, actions: number }[] = [];
	for (const action of actions) {
		for (const type of [...new Set(action.requirements.map(item => MELLOW_SYNC_REQUIREMENT_CONNECTIONS[item.type]!).filter(i => i))]) {
			const existing = connections.find(item => item.type === type);
			if (existing)
				existing.actions++
			else
				connections.push({ type, actions: 1 });
		}
	}

	const current_connections = connections.length ? await supabase.from('user_connections')
		.select('id, type, username, avatar_url, display_name')
		.eq('user_id', session.sub)
		.in('type', connections.map(item => item.type))
		.then(response => handle_response(response).data!) : [];

	if (skip_onboarding_to !== null) {
		const response = await supabase.from('user_connections')
			.select('sub')
			.eq('type', UserConnectionType.Discord)
			.eq('user_id', session.sub)
			.limit(1)
			.single();
		handle_response(response);
		await fetch(`https://mellow-internal-api.hakumi.cafe/server/${id}/member/${response.data!.sub}/sync`, {
			body: '{"is_sign_up":true}',
			method: 'POST',
			headers: {
				'x-api-key': MELLOW_KEY,
				'content-type': 'application/json'
			}
		});
	}
	return {
		...data,
		skip: skip_onboarding_to !== null,
		discord: await getDiscordServer(id).then(response => {
			if (!response.success)
				throw requestError(500, RequestErrorType.ExternalRequestError);
			return response.data;
		}),
		connections,
		current_connections
	};
};