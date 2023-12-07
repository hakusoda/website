import supabase from '$lib/supabase';
import { EMPTY_UUID } from '$lib/constants';
import type { PageServerLoad } from './$types';
import { FeatureFlag, RequestErrorType } from '$lib/enums';
import { requestError, throwIfFeatureNotEnabled } from '$lib/util/server';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ locals: { session }, params: { id } }) => {
	await throwIfFeatureNotEnabled(FeatureFlag.ProfilePostViewing);

	const response = await supabase.from('profile_posts')
		.select<string, {
			likes: [{ count: number }]
			liked: [{ count: number }]
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
				liked: [{ count: number }]
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
			parent_post_id: string | null
		}>('author:users ( id, name, username, avatar_url ), content, created_at, parent_post_id, attachments:profile_post_attachments ( url ), likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), liked:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( id, author:users ( id, name, username, avatar_url ), content, created_at, likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), liked:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( count ), attachments:profile_post_attachments ( url ) ) )')
		.eq('id', id)
		.eq('liked.user_id', session?.sub ?? EMPTY_UUID)
		.eq('comments.liked.user_id', session?.sub ?? EMPTY_UUID)
		.limit(1)
		.maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	if (response.data.parent_post_id) {
		const response2 = await supabase.from('profile_posts')
			.select<string, {
				id: string
				likes: [{ count: number }]
				liked: [{ count: number }]
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
			}>('id, author:users ( id, name, username, avatar_url ), content, created_at, likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), liked:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( count ), attachments:profile_post_attachments ( url ) )')
			.eq('id', response.data.parent_post_id)
			.eq('liked.user_id', session?.sub ?? EMPTY_UUID)
			.limit(1)
			.single();
		if (response2.error) {
			console.error(response2.error);
			throw requestError(500, RequestErrorType.ExternalRequestError);
		}

		return { ...response.data, parent: response2.data };
	}

	return response.data;
}) satisfies PageServerLoad;