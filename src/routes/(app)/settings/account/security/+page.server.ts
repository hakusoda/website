import supabase, { handleResponse } from '$lib/supabase';
export async function load({ locals: { session } }) {
	const response = await supabase.from('user_devices')
		.select('id, name, user_os, last_used_at, user_country, user_platform')
		.eq('user_id', session!.sub);
	handleResponse(response);

	return { devices: response.data! };
}