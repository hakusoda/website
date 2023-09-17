import { API_BASE } from '$lib/constants';
import type { ApiResponse, UserNotification } from '../types';
import { RequestErrorType, UserNotificationType } from '$lib/enums';
export function getDefaultAvatar(id: string) {
	let hash = 0;
	for (let i = 0; i < id.length; i++)
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	hash = Math.abs(hash);

	return `/img/avatar/default_${Math.floor(hash % 6) + 1}.svg`;
}

export function createDiscordRedirectUri(origin: string) {
	return `${origin}/roblox/verify/platform/discord`;
}

export function createMellowServerDiscordRedirectUrl(origin: string) {
	return `${origin}/settings/mellow/servers`;
}

export function createUserConnectionsDiscordRedirectUrl(origin: string) {
	return `${origin}/settings/account/connections`;
}

export function getUserNotificationUrl({ type, target_user, target_team, target_profile_post_id }: UserNotification) {
	if (type === UserNotificationType.RobloxAccountRemoved)
		return '/settings/roblox/accounts'
	if (target_profile_post_id)
		return `/user/143/post/${target_profile_post_id}`;
	if (target_team)
		return `/team/${target_team.name}`;
	if (target_user)
		return `/user/${target_user.username}`;
	return '';
}

export const uuidRegex = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

export const isUUID = (uuid: string) => uuidRegex.test(uuid);
export const hasBit = (bits: number, bit: number) => (bits & bit) === bit;

const UNKNOWN_ERROR = { error: RequestErrorType.Unknown, success: false };
export async function request<T = any>(path: string, method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	const isExternal = path.startsWith('http');
	return fetch(isExternal ? path : `${API_BASE}/${path}`, {
		body: body ? body instanceof URLSearchParams ? body.toString() : body instanceof ArrayBuffer ? body : JSON.stringify(body) : undefined,
		method,
		headers,
		credentials: 'include'
	}).then(response => response.json().then(data => {
		if (data.error)
			return { ...data, success: false };
		else if (response.status < 200 || response.status > 399)
			return UNKNOWN_ERROR;
		return { data, error: null, success: true };
	}).catch(() => {
		if (response.status < 200 || response.status > 399)
			return UNKNOWN_ERROR;
		return { success: true };
	})).catch(() => ({
		error: navigator.onLine ? RequestErrorType.FetchError : RequestErrorType.Offline, 
		success: false
	}));
}