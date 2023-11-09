import { get } from '@vercel/edge-config';
import { fail, error, redirect } from '@sveltejs/kit';
import type { ZodAny, ZodIssue, ZodSchema } from 'zod';

import supabase from '../supabase';
import { hasBit } from '.';
import { RequestErrorType } from '$lib/enums';
import type { FeatureFlag } from '$lib/enums';
import type { RequestError, UserSessionJWT } from '$lib/types';
export async function verifyServerMembership(session: UserSessionJWT | null, serverId: string, url: URL) {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const response = await supabase.from('mellow_server_members').select('id').eq('user_id', session.sub).eq('server_id', serverId).limit(1).maybeSingle();
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

export function isFeatureEnabled(feature: FeatureFlag) {
	return get<number>('feature_flags').then(value => value !== undefined ? hasBit(value, feature) : false);
}

export async function throwIfFeatureNotEnabled(feature: FeatureFlag) {
	const enabled = await isFeatureEnabled(feature);
	if (!enabled)
		throw requestError(503, RequestErrorType.FeatureFlagDisabled);
}

export function parseQuery<T extends ZodSchema = ZodAny>(request: Request, schema: T): T['_output'] {
	const result = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
	if (!result.success)
		throw requestError(400, RequestErrorType.InvalidQuery, result.error.issues);

	return result.data;
}