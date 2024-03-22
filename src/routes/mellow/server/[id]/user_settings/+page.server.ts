import { redirect } from '@sveltejs/kit';
import { getUserConnectionUrl } from '$lib/shared/util';
import supabase, { handle_response } from '$lib/server/supabase';
import { MELLOW_SYNC_REQUIREMENT_CONNECTIONS } from '$lib/shared/constants';
import type { UserConnectionType, MellowProfileSyncActionRequirementType } from '$lib/shared/enums';
export async function load({ url, locals: { session }, params: { id } }) {
	const response = await supabase.from('mellow_user_server_settings')
		.select<string, {
			server_user_connections: {
				id: string
			}[]
		}>('server_user_connections:user_connections')
		.eq('user_id', session!.sub)
		.eq('server_id', id)
		.limit(1)
		.maybeSingle();
	handle_response(response);

	const response2 = await supabase.from('user_connections')
		.select<string, {
			id: string
			sub: string
			type: UserConnectionType
			username: string | null
			created_at: string
			avatar_url: string | null
			website_url: string | null
			display_name: string | null
		}>('id, sub, type, username, created_at, avatar_url, website_url, display_name')
		.eq('user_id', session!.sub)
		.order('type');
	handle_response(response);

	const response3 = await supabase.from('mellow_servers')
		.select<string, {
			sync_actions: {
				requirements: {
					type: MellowProfileSyncActionRequirementType
				}[]
			}[]
			skip_onboarding_to: UserConnectionType | null
			required_user_connection_kinds: UserConnectionType[]
			required_user_connection_kinds_required_for_entry: boolean
		}>('sync_actions:mellow_binds( requirements:mellow_bind_requirements( type ) ), skip_onboarding_to, required_user_connection_kinds, required_user_connection_kinds_required_for_entry')
		.eq('id', id)
		.limit(1)
		.single();

	if (url.searchParams.get('as_new_member') === '') {
		const { skip_onboarding_to } = response3.data!;
		if (skip_onboarding_to !== null && !response2.data!.some(item => item.type === skip_onboarding_to))
			throw redirect(302, getUserConnectionUrl(skip_onboarding_to) + `&state=mellow_user_settings.${id}.as_new_member`);
	}

	const recommended_user_connection_kinds: UserConnectionType[] = [];
	for (const action of response3.data!.sync_actions)
		for (const requirement of action.requirements) {
			const connection_kind = MELLOW_SYNC_REQUIREMENT_CONNECTIONS[requirement.type];
			if (connection_kind !== null && !recommended_user_connection_kinds.includes(connection_kind))
				recommended_user_connection_kinds.push(connection_kind);
		}

	return {
		user_connections: response2.data!,
		...response.data ?? {
			server_user_connections: []
		},
		skip_onboarding_to: response3.data!.skip_onboarding_to,
		required_user_connection_kinds: response3.data!.required_user_connection_kinds,
		required_user_connection_kinds_required_for_entry: response3.data!.required_user_connection_kinds_required_for_entry,
		recommended_user_connection_kinds
	};
}