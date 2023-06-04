import { error } from '@sveltejs/kit';

import { getUser } from '$lib/api';
import { RobloxLinkType } from '$lib/enums';
import { getUserRobloxLinks } from '$lib/database';
import type { PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
export const load = (async ({ parent, params: { name } }) => {
	const { user } = await parent();
	const profile = (user && (user.id === name || user.username === name)) ? user : await getUser(name);
	if (!profile)
		throw error(404);

	const robloxLinks = getUserRobloxLinks(profile.id, RobloxLinkType.User).then(l => l.filter(l => l.public));
	return {
		profile,
		robloxLinks,
		robloxUsers: robloxLinks.then(async l => {
			if (!l.length)
				return [];
			const users = getRobloxUsers(l.map(l => l.target_id));
			const icons = await getRobloxAvatars(l.map(l => l.target_id));
			return users.then(u => u.map((u, k) => ({ ...u, icon: icons[k] })));
		})
	};
}) satisfies PageServerLoad;