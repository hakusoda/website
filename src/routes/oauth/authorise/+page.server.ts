import { z } from 'zod';
import { redirect } from '@sveltejs/kit';

import { parseQuery } from '$lib/util/server';
import supabase, { handleResponse } from '$lib/supabase';

const PAGE_QUERY = z.object({
	redirect_uri: z.string().transform(value => decodeURIComponent(value)).and(z.string().url()),
	application_id: z.string().uuid()
});
export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ locals: { session }, request }) => {
	if (!session)
		throw redirect(302, '/sign-in');

	const { redirect_uri, application_id } = await parseQuery(request, PAGE_QUERY);

	const response = await supabase.from('oauth_applications')
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
	handleResponse(response);

	return { ...response.data!, id: application_id, redirect_uri };
});