import supabase from '$lib/supabase';
import { isUUID } from '$lib/util';
import { MELLOW_KEY } from '$env/static/private';
import { getUserRobloxLinks } from '$lib/database';
import { requestFail, requestError } from '$lib/util/server';
import type { Actions, PageServerLoad } from './$types';
import { getRobloxUsers, getRobloxAvatars } from '$lib/api';
import { RobloxLinkType, RequestErrorType, UserConnectionType } from '$lib/enums';

export const config = { regions: ['iad1'], runtime: 'edge' };
export const load = (async ({ parent }) => {
	const user = (await parent()).user!;
	const links = getUserRobloxLinks(user.id, RobloxLinkType.User);
	const users = links.then(links => getRobloxUsers(links.map(link => link.target_id)));
	if (user.mellow_pending) {
		const response = await fetch('https://mellow.voxelified.com/signup-finished', {
			body: `${user.id}:${user.connections.find(i => i.type === UserConnectionType.Discord)?.sub}`,
			method: 'POST',
			headers: { 'x-api-key': MELLOW_KEY }
		});
		if (response.status !== 200) {
			console.error(await response.text());
			throw requestError(500, RequestErrorType.ExternalRequestError);
		}

		await supabase.from('users').update({
			mellow_pending: false
		}).eq('id', user.id);

		user.mellow_pending = false;
	}

	const response = await supabase.from('users').select('primary_roblox_link_id').eq('id', user.id).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	return {
		links,
		users,
		icons: users.then(users => getRobloxAvatars(users.map(user => user.id))),
		mellow: user.mellow_pending,
		primaryId: response.data.primary_roblox_link_id
	};
}) satisfies PageServerLoad;

export const actions = {
	unlink: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return requestFail(401, RequestErrorType.Unauthenticated);

		const id = await request.text();
		if (!isUUID(id))
			return requestFail(400, RequestErrorType.InvalidBody);

		const response = await supabase.from('roblox_links').delete().eq('id', id).eq('owner_id', session.user.id);
		if (response.error) {
			console.error(response.error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		return {};
	},
	setPrimary: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return requestFail(401, RequestErrorType.Unauthenticated);

		const id = await request.text();
		if (!isUUID(id))
			return requestFail(400, RequestErrorType.InvalidBody);

		const response = await supabase.from('users').update({
			primary_roblox_link_id: id
		}).eq('id', session.user.id);
		if (response.error) {
			console.error(response.error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		return {};
	},
	changeVisibility: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return requestFail(401, RequestErrorType.Unauthenticated);

		const [id, value] = (await request.text()).split(':');
		if (!isUUID(id) || !value)
			return requestFail(400, RequestErrorType.InvalidBody);

		const response = await supabase.from('roblox_links').update({
			public: value === 'true'
		}).eq('id', id).eq('owner_id', session.user.id);
		if (response.error) {
			console.error(response.error);
			return requestFail(500, RequestErrorType.DatabaseUpdate);
		}

		return {};
	}
} satisfies Actions;