import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ locals: { session } }) {
	const response = await supabase.from('user_devices')
		.select('id, name, user_os, last_used_at, user_country, user_platform')
		.eq('user_id', session!.sub);
	handle_response(response);

	return { devices: response.data! };
}