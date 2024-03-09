import { redirect } from '@sveltejs/kit';

import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ locals: { session }}) {
	if (!session || !session.source_connection_id)
		throw redirect(302, `/`);

	const response = await supabase.from('user_devices')
		.select('*', { head: true, count: 'exact' })
		.eq('user_id', session.sub)
		.limit(1);
	handle_response(response);

	return { has_passkey: !!response.count };
}