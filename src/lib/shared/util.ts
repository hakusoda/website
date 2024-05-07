import { browser } from '$app/environment';

import { enable_sudo_mode } from '../client/store';
import { sign_api_request } from '../client/crypto';
import type { ApiResponse, UserNotification } from './types';
import { API_BASE, UUID_REGEX, USER_CONNECTION_METADATA } from './constants';
import { RequestErrorType, UserConnectionKind, UserNotificationType } from './enums';
export function getDefaultAvatar(id: string) {
	let hash = 0;
	for (let i = 0; i < id.length; i++)
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	hash = Math.abs(hash);

	return `/img/avatar/default_${Math.floor(hash % 6) + 1}.svg`;
}

export function createMellowServerDiscordRedirectUrl(origin: string) {
	return `${origin}/settings/mellow`;
}

export function get_user_notification_uri({ type, target_user, target_team }: UserNotification) {
	if (type === UserNotificationType.UserConnectionModerated)
		return '/settings/account/connections';
	if (target_team)
		return `/team/${target_team.name}`;
	if (target_user)
		return `/user/${target_user.username}`;
	return '';
}

export function getUserConnectionUrl(type: UserConnectionKind) {
	const metadata = USER_CONNECTION_METADATA[type];
	const redirect = encodeURIComponent(`${API_BASE}/auth/callback/${type}`);
	return metadata.url.replace('RD143', redirect);
}

export function clone_json<T>(object: T): T {
	return JSON.parse(JSON.stringify(object));
}

export const isUUID = (uuid: string) => UUID_REGEX.test(uuid);
export const hasBit = (bits: number, bit: number) => (bits & bit) === bit;
export const hasOneOfBits = (bits: number, thebits: number[]) => {
	for (const bit of thebits)
		if (hasBit(bits, bit))
			return true;
	return false;
};

export function assert<T>(value: T, error_message?: string): NonNullable<T> {
	if (!value)
		throw new TypeError(error_message || 'assertion failed');
	return value;
}

export function are_json_equal(a: any, b: any) {
	return JSON.stringify(a) == JSON.stringify(b);
}

const UNKNOWN_ERROR = { error: RequestErrorType.Unknown, success: false };
export async function request<T = any>(path: string, method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	const isExternal = path.startsWith('http');
	const url = isExternal ? path : `${API_BASE}/${path}`;
	return fetch(url, {
		body: body ? body instanceof URLSearchParams ? body.toString() : body instanceof ArrayBuffer ? body : JSON.stringify(body) : undefined,
		method,
		headers: browser && !isExternal ? {
			...await sign_api_request(path, method, body),
			...headers
		} : headers,
		credentials: 'include'
	}).then(response => response.json().then(data => {
		if (data.error) {
			if (response.status === 403 && data.error === 'not_in_sudo_mode')
				return enable_sudo_mode().then(enabled => {
					if (!enabled)
						return { ...data, success: false };
					return request(path, method, body, headers);
				});
			return { ...data, success: false };
		} else if (response.status < 200 || response.status > 399)
			return UNKNOWN_ERROR;
		return { data, error: null, success: true };
	}).catch(() => {
		if (response.status < 200 || response.status > 399)
			return UNKNOWN_ERROR;
		return { success: true };
	})).catch(error => {
		console.error(error);
		return {
			error: navigator.onLine ? RequestErrorType.FetchError : RequestErrorType.Offline, 
			success: false
		};
	});
}