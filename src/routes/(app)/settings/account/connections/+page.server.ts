import type { UserConnectionKind } from '$lib/shared/enums';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ locals: { session } }) {
	const response = await supabase.from('user_connections')
		.select<string, {
			id: string
			sub: string
			type: UserConnectionKind
			username: string | null
			created_at: string
			avatar_url: string | null
			website_url: string | null
			display_name: string | null
		}>('id, sub, type, username, created_at, avatar_url, website_url, display_name')
		.eq('user_id', session!.sub)
		.order('type');
	handle_response(response);

	return { connections: response.data! };
}