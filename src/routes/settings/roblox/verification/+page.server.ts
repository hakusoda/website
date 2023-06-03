import { redirect } from '@sveltejs/kit';
import { RobloxLinkType } from '$lib/enums';
import { getUserRobloxLinks } from '$lib/database';
import type { PageServerLoad } from './$types';
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