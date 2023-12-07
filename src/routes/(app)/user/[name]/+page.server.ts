import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { EMPTY_UUID } from '$lib/constants';
import type { Actions, PageServerLoad } from './$types';
import { requestFail, requestError, isFeatureEnabled } from '$lib/util/server';
import { FeatureFlag, RequestErrorType, UserNotificationType } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ params: { name }, parent }) => {
	const { session } = await parent();
	const postsEnabled = await isFeatureEnabled(FeatureFlag.ProfilePostViewing);
	const filter = supabase.from('users')
		.select<string, {
			id: string
			bio: string | null
			name: string | null
			flags: number
			teams: {
				role: {
					name: string
				} | null
				team: {
					id: string
					name: string
					flags: number
					owner: {
						name: string | null
						username: string
					} | null
					members: [{ count: number }]
					avatar_url: string
					display_name: string
				}
			}[]
			posts: {
				id: string
				likes: [{ count: number }]
				liked: [{ count: number }]
				content: string
				comments: [{ count: number }]
				created_at: string
				attachments: { url: string }[]
			}[] | null
			burger: {
				type: UserNotificationType
			}[]
			username: string
			is_edited: boolean
			following: [{ count: number }]
			followers: [{ count: number }]
			avatar_url: string
			created_at: string
			team_invites: {
				team_id: string
			}[]
		}>(`id, bio, name, flags, username, is_edited, following:user_followers!user_followers_target_user_id_fkey ( count ), followers:user_followers!user_followers_target_user_id_fkey ( count ), avatar_url, created_at, teams:team_members!team_members_user_id_fkey ( role:team_roles ( name ), team:teams ( id, name, flags, owner:users!teams_owner_id_fkey ( name, username ), avatar_url, display_name, members:team_members ( count ) ) ), team_invites!team_invites_user_id_fkey ( team_id ), burger:user_notifications!user_notifications_user_id_fkey ( type )${postsEnabled ? ', posts:profile_posts ( id, content, created_at, likes:profile_post_likes!profile_post_likes_post_id_fkey ( count ), liked:profile_post_likes!profile_post_likes_post_id_fkey ( count ), comments:profile_posts ( count ), attachments:profile_post_attachments ( url ) )' : ''}`)
		.eq(isUUID(name) ? 'id' : 'username', name)
		.eq('user_notifications.target_user_id', session?.sub ?? EMPTY_UUID)
		.eq('user_notifications.type', UserNotificationType.SOMETHING)
		.eq('following.user_id', session?.sub ?? EMPTY_UUID);
	if (postsEnabled) {
		filter
		.is('posts.parent_post_id', null)
		.eq('posts.liked.user_id', session?.sub ?? EMPTY_UUID)
		.order('created_at', { ascending: false, foreignTable: 'profile_posts' });
	}
		
	const response = await filter
		.limit(1)
		.maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(404, RequestErrorType.NotFound);

	const myTeams = session ? await supabase.from('team_members').select<string, {
		team: {
			id: string
			avatar_url: string
			display_name: string
		}
	}>('team:teams ( id, avatar_url, display_name )').eq('user_id', session.sub) : null;
	if (myTeams?.error) {
		console.error(myTeams.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	const teams = response.data.teams.map(team => ({
		role: team.role,
		...team.team
	})).sort((a, b) => a.display_name.localeCompare(b.display_name));
	const my_teams = myTeams?.data?.map(item => item.team).sort((a, b) => a.display_name.localeCompare(b.display_name)) || [];
	const team_invites = response.data.team_invites.filter(invite => my_teams.some(team => team.id === invite.team_id));
	return {
		...response.data,
		teams,
		my_teams: my_teams.filter(item => !teams.some(team => team.id === item.id) && !team_invites.some(invite => invite.team_id === item.id)),
		team_invites
	};
}) satisfies PageServerLoad;

export const actions = {
	burger: async ({ locals: { session }, params: { name } }) => {
		if (!session)
			return requestFail(401, RequestErrorType.Unauthenticated);

		const response = await supabase.from('users').select('id').eq(isUUID(name) ? 'id' : 'username', name).limit(1).single();
		if (response.error) {
			console.error(response.error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		const { error } = await supabase.from('user_notifications').upsert({
			type: UserNotificationType.SOMETHING,
			user_id: response.data.id,
			target_user_id: session.sub
		});
		if (error) {
			console.error(error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		return {};
	}
} satisfies Actions;