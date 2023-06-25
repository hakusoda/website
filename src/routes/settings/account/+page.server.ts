import { z } from 'zod';
import { fail, error } from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { USERNAME_REGEX } from '$lib/constants';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';
export const config = { regions: ['iad1'] };
export const load = (async ({ locals: { getSession } }) => {
	const session = (await getSession())!;
	const response = await supabase.from('users').select('name, username, avatar_url, created_at').eq('id', session.user.id).limit(1).single();
	if (response.error) {
		console.error(response.error);
		throw error(500);
	}

	return response.data;
}) satisfies PageServerLoad;

const EDIT_PROFILE_SCHEMA = z.object({
	username: z.string().regex(USERNAME_REGEX).min(3).max(20)
});

export const actions = {
	edit: async ({ locals: { getSession }, request }) => {
		const session = await getSession();
		if (!session)
			return fail(401, { error: RequestErrorType.Unauthenticated } satisfies RequestError);

		const data = EDIT_PROFILE_SCHEMA.safeParse(await request.json());
		if (!data.success) {
			console.error(data.error);
			return fail(400, {
				error: RequestErrorType.InvalidBody,
				issues: data.error.issues
			} satisfies RequestError);
		}

		const response = await supabase.from('users').update({
			username: data.data.username
		}).eq('id', session.user.id);
		if (response.error) {
			console.error(response.error);
			return fail(500, { error: RequestErrorType.DatabaseUpdate } satisfies RequestError);
		}

		return {};
	}
} satisfies Actions;