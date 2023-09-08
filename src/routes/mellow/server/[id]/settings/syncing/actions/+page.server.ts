import { z } from 'zod';
import { fail, error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import type { RequestError } from '$lib/types';
import { getDiscordServerRoles } from '$lib/discord';
import { verifyServerMembership } from '$lib/util/server';
import { createMellowServerAuditLog } from '$lib/database';
import type { Actions, PageServerLoad } from './$types';
import { lookupRobloxGroups, getRobloxGroupRoles, getRobloxGroupAvatars } from '$lib/api';
import { MellowProfileSyncActionType, RequestErrorType, MellowServerAuditLogType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '$lib/enums';
export const config = { regions: ['iad1'] };
export const load = (async ({ params: { id } }) => {
	const response = await supabase.from('mellow_binds').select<string, {
		id: string
		name: string
		data: string[]
		type: MellowProfileSyncActionType
		edits: {
			type: MellowServerAuditLogType
			author: {
				name: string | null
				username: string
			}
			created_at: string
		}[]
		creator: {
			name: string | null
			username: string
		} | null
		created_at: string
		requirements: {
			id: string
			data: string[]
			type: MellowProfileSyncActionRequirementType
		}[]
		requirements_type: MellowProfileSyncActionRequirementsType
	}>('id, name, type, data, creator:users ( name, username ), created_at, requirements_type, requirements:mellow_bind_requirements ( id, type, data ), edits:mellow_server_audit_logs ( type, author:users ( name, username ), created_at )').eq('server_id', id).order('created_at');
	if (response.error)
		console.error(response.error);

	if (response.error || !response.data)
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));

	const roles = await getDiscordServerRoles(id);
	if (!roles.success) {
		console.error(roles.error);
		throw error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	return {
		binds: response.data.map(item => {
			const edits = item.edits.filter(item => item.type === MellowServerAuditLogType.UpdateRobloxLink);
			return {
				...item,
				edits: undefined,
				last_edit: edits.reverse()[0]
			};
		}),
		roles: roles.data.filter(role => role.name !== '@everyone' && !role.managed).sort((a, b) => b.position - a.position).map(role => ({ id: role.id, name: role.name }))
	};
}) satisfies PageServerLoad;

const UPDATE_SCHEMA =  z.object({
	name: z.string().max(50).optional(),
	data: z.array(z.string().max(256)).min(1).max(50).optional(),
	type: z.nativeEnum(MellowProfileSyncActionType).optional(),
	target: z.string(),
	requirements: z.array(z.object({
		data: z.array(z.string().max(100)).max(5),
		type: z.nativeEnum(MellowProfileSyncActionRequirementType)
	})).optional(),
	requirementsType: z.nativeEnum(MellowProfileSyncActionRequirementsType).optional()
});

export const actions = {
	update: async ({ locals: { getSession }, params: { id }, request }) => {
		const session = await getSession();
		await verifyServerMembership(session, id);

		const body = await request.json();
		const response = UPDATE_SCHEMA.safeParse(body);
		if (!response.success) {
			console.error(response.error);
			return fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: response.error.issues
			} satisfies RequestError);
		}

		const { data } = response;

		const user = await supabase.from('users').select('name, username').eq('id', session!.user.id).single();
		if (user.error) {
			console.error(user.error);
			return fail(500, { error: RequestErrorType.ExternalRequestError } satisfies RequestError);
		}

		const response1 = await supabase.from('mellow_binds').select('id, name, type, data, creator:users ( name, username ), created_at, requirements_type, requirements:mellow_bind_requirements ( id, type, data )').eq('id', data.target).eq('server_id', id).single();
		if (response1.error) {
			console.error(response1.error);
			return fail(500, { error: RequestErrorType.ExternalRequestError } satisfies RequestError);
		}

		let final = response1.data;
		if (data.name !== undefined || data.type !== undefined || data.data || data.requirementsType !== undefined) {
			const response2 = await supabase.from('mellow_binds').update({
				name: data.name,
				type: data.type,
				data: data.data,
				requirements_type: data.requirementsType
			}).eq('id', data.target).eq('server_id', id).select('id, name, type, data, creator:users ( name, username ), created_at, requirements_type').single();
			if (response2.error) {
				console.error(response2.error);
				return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
			}

			final = {
				...final,
				...response2.data
			};
		}

		if (data.requirements) {
			const response3 = await supabase.from('mellow_bind_requirements').delete().eq('bind_id', data.target);
			if (response3.error) {
				console.error(response3.error);
				return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
			}

			if (data.requirements.length) {
				const response4 = await supabase.from('mellow_bind_requirements').insert(data.requirements.map(item => ({
					type: item.type,
					data: item.data,
					bind_id: data.target
				}))).select('id, type, data');
				if (response4.error) {
					console.error(response4.error);
					return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
				}

				final.requirements = response4.data;
			} else
				final.requirements = [];
		}

		await createMellowServerAuditLog(MellowServerAuditLogType.UpdateRobloxLink, session!.user.id, id, {
			name: [response1.data.name, data.name],
			type: [response1.data.type, data.type],
			data: [response1.data.data, data.data],
			requirements: data.requirements?.length,
			requirements_type: [response1.data.requirements_type, data.requirementsType]
		}, data.target);

		return {
			...final,
			last_edit: {
				type: MellowServerAuditLogType.UpdateRobloxLink,
				author: user.data,
				created_at: Date.now()
			}
		};
	},
	searchGroups: async ({ locals: { getSession }, params: { id }, request }) => {
		await verifyServerMembership(await getSession(), id);

		const body = await request.text();
		if (typeof body !== 'string')
			throw fail(400, { error: RequestErrorType.InvalidBody } satisfies RequestError);

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
			throw fail(400, { error: RequestErrorType.InvalidBody } satisfies RequestError);

		return await getRobloxGroupRoles(body);
	}
} satisfies Actions;