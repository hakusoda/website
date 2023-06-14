import { z } from 'zod';
import * as kit from '@sveltejs/kit';
import type { ZodIssue } from 'zod';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { getDiscordServerRoles } from '$lib/discord';
import { verifyServerMembership } from '$lib/util/server';
import type { Actions, PageServerLoad } from './$types';
import { lookupRobloxGroups, getRobloxGroupRoles, getRobloxGroupAvatars } from '$lib/api';
import { MellowBindType, RequestErrorType, MellowBindRequirementType, MellowBindRequirementsType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const { data, error } = await supabase.from('mellow_binds').select<string, {
		id: string
		name: string
		type: MellowBindType
		creator: {
			name: string | null
			username: string
		}
		created_at: string
		target_ids: string[]
		requirements: {
			id: string
			data: string[]
			type: MellowBindRequirementType
		}[]
		requirements_type: MellowBindRequirementsType
	}>('id, name, type, creator:users ( name, username ), created_at, target_ids, requirements_type, requirements:mellow_bind_requirements ( id, type, data )').eq('server_id', id);
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
	data: z.array(z.string().max(100)).min(1).max(100),
	type: z.nativeEnum(MellowBindType),
	requirements: z.array(z.object({
		data: z.array(z.string().max(100)).max(5),
		type: z.nativeEnum(MellowBindRequirementType)
	})),
	requirementsType: z.nativeEnum(MellowBindRequirementsType)
});

export const actions = {
	create: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = (await getSession())!;
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = CREATE_SCHEMA.safeParse(body);
		if (!response.success) {
			console.log(response.error);
			return kit.fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: response.error.issues
			} satisfies RequestError);
		}

		const { data } = response;
		const issues: ZodIssue[] = [];
		for (const [index, { type, data: rData }] of Object.entries(data.requirements)) {
			if (type === MellowBindRequirementType.HasRobloxGroupRole || type === MellowBindRequirementType.HasRobloxGroupRankInRange) {
				if (!isFinite(+rData[0]))
					issues.push({
						code: 'custom',
						path: ['requirements', index, 'data', 0],
						message: ''
					});
			}

			if (type === MellowBindRequirementType.HasRobloxGroupRole) {
				if (!isFinite(+rData[1]))
					issues.push({
						code: 'custom',
						path: ['requirements', index, 'data', 1],
						message: ''
					});
			} else if (type === MellowBindRequirementType.HasRobloxGroupRankInRange) {
				const [_, min, max] = rData;
				if (!min || !isFinite(+min) || +min <= 0)
					issues.push({
						code: 'custom',
						path: ['requirements', index, 'data', 1],
						message: ''
					});
				if (!max || !isFinite(+max) || +max > 255)
					issues.push({
						code: 'custom',
						path: ['requirements', index, 'data', 2],
						message: ''
					});
			}
		}

		if (issues.length)
			return kit.fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: issues
			} satisfies RequestError);

		const response2 = await supabase.from('mellow_binds').insert({
			name: data.name,
			type: data.type,
			creator: session.user.id,
			server_id: id,
			target_ids: data.data,
			requirements_type: data.requirementsType
		}).select('id, name, type, creator:users ( name, username ), created_at, target_ids, requirements_type').limit(1).single();
		if (response2.error) {
			console.log(response2.error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		const response3 = await supabase.from('mellow_bind_requirements').insert(data.requirements.map(item => ({
			type: item.type,
			data: item.data,
			bind_id: response2.data.id
		}))).select('id, type, data');
		if (response3.error) {
			console.log(response3.error);
			return kit.fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {
			...response2.data,
			requirements: response3.data
		};
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
	},
	searchGroups: async ({ locals: { getSession }, params: { id }, request }) => {
		await verifyServerMembership(await getSession(), id);

		const body = await request.text();
		if (typeof body !== 'string')
			throw kit.error(400, 'Invalid Request Body');

		const groups = await lookupRobloxGroups(body);
		const icons = await getRobloxGroupAvatars(groups.map(group => group.id));
		return groups.map(group => ({
			...group,
			icon: icons.find(i => i.targetId === group.id)?.imageUrl
		}));
	},
	getRoles: async ({ locals: { getSession }, params: { id }, request }) => {
		await verifyServerMembership(await getSession(), id);

		const body = await request.text();
		if (typeof body !== 'string')
			throw kit.error(400, 'Invalid Request Body');

		return await getRobloxGroupRoles(body);
	}
} satisfies Actions;