import { z } from 'zod';
import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { getDiscordServerRoles } from '$lib/discord';
import { verifyServerMembership } from '$lib/util/server';
import type { Actions, PageServerLoad } from './$types';
import { MellowBindType, MellowBindRequirementType } from '$lib/enums';
export const load = (async ({ params: { id } }) => {
	const { data, error } = await supabase.from('mellow_binds').select<string, {
		id: string
		name: string
		type: MellowBindType
		created_at: string
		target_ids: string[]
		requirements: {
			id: string
			data: string[]
			type: MellowBindRequirementType
			created_at: string
		}[]
	}>('id, name, type, created_at, target_ids, requirements:mellow_bind_requirements ( id, type, data, created_at )').eq('server_id', id);
	if (error) {
		console.error(error);
		throw kit.error(500, error.message);
	}

	if (!data)
		throw kit.error(500);

	const roles = await getDiscordServerRoles(id);
	if (roles.error) {
		console.log(roles.error);
		throw kit.error(500);
	}
	return {
		binds: data,
		roles: roles.data.filter(role => role.name !== '@everyone' && !role.managed).sort((a, b) => b.position - a.position).map(role => ({ id: role.id, name: role.name }))
	};
}) satisfies PageServerLoad;

const CREATE_SCHEMA = z.object({
	name: z.string().max(50),
	data: z.array(z.string().max(100)),
	type: z.nativeEnum(MellowBindType),
	requirements: z.array(z.object({
		data: z.array(z.string().max(100)),
		type: z.nativeEnum(MellowBindRequirementType)
	}))
});

export const actions = {
	create: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = (await getSession())!;
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = CREATE_SCHEMA.safeParse(body);
		if (!response.success) {
			console.log(response.error);
			throw kit.error(400, 'Invalid Request Body');
		}

		const { data } = response;
		const response2 = await supabase.from('mellow_binds').insert({
			name: data.name,
			type: data.type,
			creator: session.user.id,
			server_id: id,
			target_ids: data.data
		}).select('id').limit(1).single();
		if (response2.error) {
			console.log(response2.error);
			throw kit.error(500, response2.error.message);
		}

		const response3 = await supabase.from('mellow_bind_requirements').insert(data.requirements.map(item => ({
			type: item.type,
			data: item.data,
			bind_id: response2.data.id
		})));
		if (response3.error) {
			console.log(response3.error);
			throw kit.error(500, response3.error.message);
		}

		return {};
	},
	delete: async ({ locals: { getSession }, params: { id }, request }) => {
		await verifyServerMembership(await getSession(), id);

		const body = await request.text();
		if (typeof body !== 'string')
			throw kit.error(400, 'Invalid Request Body');

		const response = await supabase.from('mellow_binds').delete().eq('id', body).eq('server_id', id);
		if (response.error) {
			console.log(response.error);
			throw kit.error(500, response.error.message);
		}

		return {};
	}
} satisfies Actions;