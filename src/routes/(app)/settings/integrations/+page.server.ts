import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	const response = await supabase.from('application_authorisations')
		.select<string, {
			id: string
			updated_at: string
			application: {
				id: string
				name: string
				owner: {
					id: string
					name: string
					display_name: string
				}
				summary: string
				avatar_url: string
			}
		}>('id, updated_at, application:applications ( name, owner:teams ( id, name, display_name ), summary, avatar_url )')
		.eq('user_id', session!.sub);
	handleResponse(response);

	return { applications: response.data! };
}