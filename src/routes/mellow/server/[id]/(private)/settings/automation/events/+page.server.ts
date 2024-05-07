import type { Document } from '$lib/shared/types/visual_scripting';
import supabase, { handle_response } from '$lib/server/supabase';
export async function load({ params: { id } }) {
	const response = handle_response(await supabase.from('visual_scripting_documents')
		.select<string, Document>('id, name, kind, definition, created_by:users ( id, name, username, avatar_url )')
		.eq('mellow_server_id', id)
	);

	return { documents: response.data! };
}