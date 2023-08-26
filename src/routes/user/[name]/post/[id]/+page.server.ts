import supabase from '$lib/supabase';
import { requestError } from '$lib/util/server';
import { RequestErrorType } from '$lib/enums';
import type { PageServerLoad } from './$types';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { id }, parent }) => {
	const response = await supabase.from('profile_posts').select<string, {
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
		}[]
		created_at: string
	}>('author:users ( id, name, username, avatar_url ), content, created_at, likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( id, author:users ( id, name, username, avatar_url ), content, created_at, likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( count ) ) )').eq('id', id).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	return response.data;
}) satisfies PageServerLoad;