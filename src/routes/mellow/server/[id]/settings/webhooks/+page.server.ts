import supabase, { handleResponse } from '$lib/supabase';
export async function load({ params: { id } }) {
	return { streamed: {
		items: supabase.from('mellow_server_webhooks')
			.select<string, {
				id: string
				name: string
				events: number
				enabled: boolean
				creator: {
					name: string | null
					username: string
				} | null
				target_url: string
				created_at: string
				request_method: string
			}>('id, name, events, creator:users ( name, username ), enabled, target_url, created_at, request_method')
			.eq('server_id', id)
			.then(handleResponse)
			.then(response => response.data!)
	} };
}