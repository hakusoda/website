import * as kit from '@sveltejs/kit';

import supabase from '$lib/supabase';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
import type { LayoutServerLoad } from './$types';
import { verifyServerMembership } from '$lib/util/server';
export const load = (async ({ params: { id }, parent }) => {
	await verifyServerMembership((await parent()).session, id);

	const { data, error } = await supabase.from<string, {
		name: string
	}>('mellow_servers').select('name').eq('id', id).limit(1).single();
	if (error) {
		console.error(error);
		throw kit.error(500, JSON.stringify({
			error: RequestErrorType.ExternalRequestError
		} satisfies RequestError));
	}

	return data;
}) satisfies LayoutServerLoad;