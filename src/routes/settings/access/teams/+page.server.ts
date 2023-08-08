import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const { session } = await parent();
	const response = await supabase.from('team_members').select<string, {
		role: {
			permissions: number
		} | null
		team: {
			name: string
			flags: number
			members: [{ count: number }]
			owner_id: string | null
			avatar_url: string
			display_name: string
		}
	}>('team:teams ( name, flags, members:team_members ( count ), owner_id, avatar_url, display_name ), role:team_roles ( permissions )').eq('user_id', session!.user.id);
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		teams: response.data.map(item => ({
			...item.team,
			role: item.role
		}))
	};
}) satisfies PageServerLoad;