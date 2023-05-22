import { getUser } from '$lib/api';
import { RobloxLinkType } from '$lib/enums';
import type { PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars, getUserRobloxLinks } from '$lib/api';
export const load = (async ({ parent, params: { name } }) => {
	const { user } = await parent();
	const profile = (user && (user.id === name || user.username === name)) ? Promise.resolve(user) : getUser(name);
	const robloxLinks = getUserRobloxLinks(name, RobloxLinkType.User);
	return {
		profile,
		robloxLinks,
		robloxUsers: robloxLinks.then(async l => {
			if (!l?.length)
				return [];
			const users = getRobloxUsers(l.map(l => l.target_id));
			const icons = await getRobloxAvatars(l.map(l => l.target_id));
			return users.then(u => u.map((u, k) => ({ ...u, icon: icons[k] })))
		})
	};
}) satisfies PageServerLoad;