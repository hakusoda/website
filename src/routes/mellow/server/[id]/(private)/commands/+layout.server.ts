import type { Document } from '$lib/shared/types/visual_scripting';
import supabase, { handle_response } from '$lib/server/supabase';
export const load = async ({ params: { id } }) => {
	const response = handle_response(await supabase.from('mellow_server_commands')
		.select<string, {
			id: string
			name: string
			kind: 'slash_command'
			active: boolean
			document: Document
			created_at: string
			description: string
		}>('id, name, active, document:visual_scripting_documents ( id, name, kind, definition ), created_at, description')
		.eq('server_id', id)
	);

	return { commands: response.data! };
};