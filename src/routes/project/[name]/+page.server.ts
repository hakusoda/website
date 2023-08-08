import  { error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name } }) => {
	const response = await supabase.from('projects').select<string, {
		id: string
		bio: string | null
		name: string
		summary: string
		creator: {
			id: string
			name: string
			members: { id: string }[]
			avatar_url: string
			display_name: string
		}
		avatar_url: string
		banner_url: string
		created_at: string
		updated_at: string
		github_url: string | null
		archived_at: string | null
		website_url: string | null
		theme_color: string | null
		display_name: string
		contributors: {
			user: {
				id: string
				name: string
				username: string
				avatar_url: string | null
				created_at: string
			}
		}[]
		external_contributors: number
	}>('id, bio, name, summary, avatar_url, banner_url, created_at, updated_at, github_url, archived_at, website_url, theme_color, display_name, creator:teams ( id, name, avatar_url, display_name, members:team_members ( id ) ), contributors:project_contributors ( user:users ( id, name, username, avatar_url, created_at ) ), external_contributors').eq(isUUID(name) ? 'id' : 'name', name).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	if (!response.data)
		throw error(404);

	return {
		...response.data,
		creator: response.data.creator,
		contributors: response.data.contributors.map(item => item.user)
	};
}) satisfies PageServerLoad;