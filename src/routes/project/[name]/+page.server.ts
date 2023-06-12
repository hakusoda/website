import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { PageServerLoad } from './$types';
import { getUserAvatar, getTeamAvatar, getProjectAvatar, getProjectBanner } from '$lib/database';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { name } }) => {
	const { data, error } = await supabase.from('projects').select<string, {
		id: string
		bio: string | null
		name: string
		summary: string
		creator: {
			id: string
			name: string
			members: { id: string }[]
			display_name: string
		}
		created_at: string
		github_url: string | null
		website_url: string | null
		display_name: string
		contributors: {
			user: {
				id: string
				name: string
				username: string
				created_at: string
			}
		}[]
		external_contributors: number
	}>('id, bio, name, summary, created_at, github_url, website_url, display_name, creator:teams ( id, name, display_name, members:team_members ( id ) ), contributors:project_contributors ( user:users ( id, name, username, created_at ) ), external_contributors').eq(isUUID(name) ? 'id' : 'name', name).limit(1).maybeSingle();
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(404);

	return {
		...data,
		creator: {
			...data.creator,
			avatar_url: getTeamAvatar(data.creator.id)
		},
		avatar_url: getProjectAvatar(data.id),
		banner_url: getProjectBanner(data.id),
		contributors: data.contributors.map(item => ({
			...item.user,
			avatar_url: getUserAvatar(item.user.id)
		}))
	};
}) satisfies PageServerLoad;