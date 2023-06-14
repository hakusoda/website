import { fail, redirect } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import type { RequestError } from '$lib/types';
import { getUserRobloxLinks } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
import { RobloxLinkType, RequestErrorType } from '$lib/enums';
export const config = { regions: ['iad1'] };
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
			return fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const id = await request.text();
		if (!isUUID(id))
			return fail(400, { error: RequestErrorType.InvalidBody } satisfies RequestError);

		const response = await supabase.from('roblox_links').delete().eq('id', id).eq('owner', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	},
	changeVisibility: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const [id, value] = (await request.text()).split(':');
		if (!isUUID(id) || !value)
			return fail(400, { error: RequestErrorType.InvalidBody } satisfies RequestError);

		const response = await supabase.from('roblox_links').update({
			public: value === 'true'
		}).eq('id', id).eq('owner', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	}
} satisfies Actions;