import { z } from 'zod';
import { redirect } from '@sveltejs/kit';

import { parseQuery } from '$lib/util/server';
import supabase, { handleResponse } from '$lib/supabase';
import { APPLICATION_OAUTH_SCOPE_TYPES, APPLICATION_OAUTH_SCOPE_OPERATIONS } from '$lib/constants';

const PAGE_QUERY = z.object({
	scopes: z.string()
		.transform(data => data.split(','))
		.refine(data => data.every(item => {
			const [type, operation] = item.split(':');
			return APPLICATION_OAUTH_SCOPE_TYPES.includes(type as any) && APPLICATION_OAUTH_SCOPE_OPERATIONS.includes(operation as any);
		})),
	redirect_uri: z.string().transform(value => decodeURIComponent(value)).and(z.string().url()),
	application_id: z.string().uuid()
});
export async function load({ url, locals: { session }, request }) {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const { redirect_uri, application_id } = parseQuery(request, PAGE_QUERY);

	/*const response = await supabase.from('application_authorisations')
		.select('scopes')
		.eq('user_id', session.sub)
		.eq('application_id', application_id)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	if (response.data && scopes.every(item => response.data!.scopes.includes(item))) {
		
	}*/

	const response2 = await supabase.from('applications')
		.select<string, {
			name: string
			owner: {
				id: string
				name: string
				display_name: string
			}
			avatar_url: string
			redirect_uris: string[]
		}>('name, owner:teams ( id, name, display_name ), avatar_url, redirect_uris')
		.eq('id', application_id)
		.limit(1)
		.maybeSingle();
	handleResponse(response2);

	return { ...response2.data!, id: application_id, redirect_uri };
}