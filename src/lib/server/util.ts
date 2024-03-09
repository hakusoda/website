import { get } from '@vercel/edge-config';
import type { ZodAny, ZodIssue, ZodSchema } from 'zod';
import { fail, error, redirect, type NumericRange } from '@sveltejs/kit';

import { hasBit } from '../shared/util';
import supabase, { handle_response } from './supabase';
import type { RequestError, UserSessionJWT } from '../shared/types';
import { RequestErrorType, type FeatureFlag } from '../shared/enums';
export async function verify_mellow_server_access(session: UserSessionJWT | null, server_id: string, url: URL) {
	if (!session)
		throw redirect(302, `/sign-in?redirect_uri=${encodeURIComponent(url.pathname + url.search)}`);

	const response = await supabase.rpc('mellow_server_accessible_by_user2', {
		user_id: session.sub,
		server_id
	});
	handle_response(response);

	if (!response.data)
		throw requestError(403, RequestErrorType.Unauthorised);
}

export function requestFail(status_code: number, type: RequestErrorType, issues?: ZodIssue[]) {
	return fail(status_code, { error: type, issues } satisfies RequestError);
}

export function requestError(status_code: NumericRange<400, 599>, type: RequestErrorType, issues?: ZodIssue[]) {
	return error(status_code, JSON.stringify({
		error: type,
		issues
	} satisfies RequestError));
}

export function is_feature_enabled(feature: FeatureFlag) {
	return get<number>('feature_flags').then(value => value !== undefined ? hasBit(value, feature) : false);
}

export async function throwIfFeatureNotEnabled(feature: FeatureFlag) {
	const enabled = await is_feature_enabled(feature);
	if (!enabled)
		throw requestError(503, RequestErrorType.FeatureFlagDisabled);
}

export function parseQuery<T extends ZodSchema = ZodAny>(request: Request, schema: T): T['_output'] {
	const result = schema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
	if (!result.success)
		throw requestError(400, RequestErrorType.InvalidQuery, result.error.issues);

	return result.data;
}