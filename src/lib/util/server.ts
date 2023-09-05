import type { Session } from '@supabase/supabase-js';
import type { ZodIssue } from 'zod';
import { fail, error, redirect } from '@sveltejs/kit';

import supabase from '../supabase';
import { RequestErrorType } from '$lib/enums';
import type { RequestError } from '$lib/types';
export async function verifyServerMembership(session: Session | null, serverId: string) {
	if (!session)
		throw redirect(302, '/sign-in');

	const response = await supabase.from('mellow_server_members').select('id').eq('user_id', session.user.id).eq('server_id', serverId).limit(1).maybeSingle();
	if (response.error) {
		console.error(response.error);
		throw requestError(500, RequestErrorType.ExternalRequestError);
	}

	if (!response.data)
		throw requestError(403, RequestErrorType.Unauthorised);
}

export function requestFail(statusCode: number, type: RequestErrorType, issues?: ZodIssue[]) {
	return fail(statusCode, { error: type, issues } satisfies RequestError);
}

export function requestError(statusCode: number, type: RequestErrorType, issues?: ZodIssue[]) {
	return error(statusCode, JSON.stringify({
		error: type,
		issues
	} satisfies RequestError));
}