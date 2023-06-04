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
	return {
		links,
		users: links.then(async l => {
			if (!l.length)
				return [];
			const users = getRobloxUsers(l.map(l => l.target_id));
			const icons = await getRobloxAvatars(l.map(l => l.target_id));
			return users.then(u => u.map((u, k) => ({ ...u, icon: icons[k] })));
		})
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