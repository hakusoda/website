import { json } from '@sveltejs/kit';

import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { RequestHandler } from './$types';
import supabase, { handleResponse } from '$lib/supabase';
export const GET = (async ({ url, params: { id } }) => {
	const response = await supabase.from('profile_posts')
		.select<string, {
			likes: [{ count: number }]
			author: {
				id: string
				name: string | null
				username: string
				avatar_url: string | null
			}
			content: string
			comments: {
				id: string
				likes: [{ count: number }]
				author: {
					id: string
					name: string | null
					username: string
					avatar_url: string | null
				}
				content: string
				comments: [{ count: number }]
				created_at: string
				attachments: { url: string }[]
			}[]
			created_at: string
			attachments: { url: string }[]
		}>('author:users ( name, username, avatar_url ), content, created_at, attachments:profile_post_attachments ( url )')
		.eq('id', id)
		.limit(1)
		.maybeSingle();
	handleResponse(response);

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return json({
		type: 'photo',
		author_url: `${url.origin}/user/${response.data.author.username}`,
		author_name: response.data.author.name ? `${response.data.author.name} (@${response.data.author.username})` : response.data.author.username
	});
}) satisfies RequestHandler;