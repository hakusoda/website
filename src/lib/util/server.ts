import base64 from '@hexagon/base64';
import { get } from '@vercel/edge-config';
import { SignJWT } from 'jose';
import type { ZodIssue } from 'zod';
import { fail, error, redirect } from '@sveltejs/kit';

import supabase from '../supabase';
import { hasBit } from '.';
import { JWT_SECRET } from '$lib/constants/server';
import { RequestErrorType } from '$lib/enums';
import type { FeatureFlag } from '$lib/enums';
import type { RequestError, UserSessionJWT } from '$lib/types';
export async function verifyServerMembership(session: UserSessionJWT | null, serverId: string) {
	if (!session)
		throw redirect(302, '/sign-in');

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

export async function createUserSession(sub: string): Promise<[string, UserSessionJWT]> {
	const now = Date.now();
	const iat = Math.floor(now / 1000);
	const exp = iat + 3600;
	const token = await new SignJWT({ sub })
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime('1h')
		.sign(JWT_SECRET);
	return [token, { exp, iat, sub }];
}

export async function createRefreshToken(user_id: string) {
	const token = new Uint32Array(64);
	crypto.getRandomValues(token);

	const refresh_token = base64.fromArrayBuffer(token);
	const response = await supabase.from('user_refresh_tokens')
		.insert({ user_id, refresh_token });
	if (response.error) {
		console.error(error);
		throw requestError(500, RequestErrorType.DatabaseUpdate);
	}

	return refresh_token;
}

export function isFeatureEnabled(feature: FeatureFlag) {
	return get<number>('feature_flags').then(value => value !== undefined ? hasBit(value, feature) : false);
}

export async function throwIfFeatureNotEnabled(feature: FeatureFlag) {
	const enabled = await isFeatureEnabled(feature);
	if (!enabled)
		throw requestError(503, RequestErrorType.FeatureFlagDisabled);
}