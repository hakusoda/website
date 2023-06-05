import { fail, redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { RobloxLinkType } from '$lib/enums';
import { getUserRobloxLinks } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
export const load = (async ({ parent }) => {
	const { user } = await parent();
	if (!user)
		throw redirect(302, '/login');

	const links = getUserRobloxLinks(user.id, RobloxLinkType.User);
	const users = links.then(links => getRobloxUsers(links.map(link => link.target_id)));
	if (user.mellow_pending)
		await supabase.from('users').update({
			mellow_pending: false
		}).eq('id', user.id);

	return {
		links,
		users,
		icons: users.then(users => getRobloxAvatars(users.map(user => user.id))),
		mellow: user.mellow_pending
	};
}) satisfies PageServerLoad;

export const actions = {
	unlink: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401);

		const id = await request.text();
		if (!isUUID(id))
			return fail(400);

		const response = await supabase.from('roblox_links').delete().eq('id', id).eq('owner', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500);
		}

		return { success: true };
	},
	changeVisibility: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401);

		const [id, value] = (await request.text()).split(':');
		if (!isUUID(id))
			return fail(400);

		const response = await supabase.from('roblox_links').update({
			public: value === 'true'
		}).eq('id', id).eq('owner', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500);
		}

		return { success: true };
	}
} satisfies Actions;