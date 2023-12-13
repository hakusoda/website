import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	const response = await supabase.from('team_members').select<string, {
		role: {
			name: string
			permissions: number
		} | null
		team: {
			name: string
			flags: number
			owner: {
				id: string
				name: string
				username: string | null
			} | null
			members: [{ count: number }]
			avatar_url: string
			display_name: string
		}
	}>('team:teams ( name, flags, members:team_members ( count ), owner:users!teams_owner_id_fkey ( id, name, username ), avatar_url, display_name ), role:team_roles ( name, permissions )').eq('user_id', session!.sub);
	handleResponse(response);

	return {
		teams: response.data!.map(item => ({
			...item.team,
			role: item.role
		}))
	};
}