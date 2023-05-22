import { get } from 'svelte/store';
import { page } from '$app/stores';
import type { HttpMethod } from '@sveltejs/kit/types/private';

import type { RobloxLinkType } from './enums';
import type { User, RobloxLink, RobloxUser, ApiResponse } from './types';
export const API_BASE = 'https://api.voxelified.com/v1';

export function getUser(userId: string) {
	return request<User>(`user/${userId}`).then(response => response.error ? null : response.data);
}

export function getUserRobloxLinks(userId: string, linkType?: RobloxLinkType) {
	return request<RobloxLink[]>(`user/${userId}/roblox/links?type=${linkType}`).then(response => response.error ? [] : response.data);
}

export function getRobloxUsers(userIds: number[]) {
	return request<{ data: RobloxUser[] }>(`https://users.roblox.com/v1/users`, 'POST', {
		userIds,
		excludeBannedUsers: false
	}).then(response => response.error ? [] : response.data.data);
}

export function getRobloxAvatars(userIds: number[]) {
	return request<{ data: { state: string, targetId: number, imageUrl: string }[] }>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(',')}&format=Png&size=48x48`)
		.then(response => response.error ? [] : response.data.data.map(i => i.imageUrl))
}

export function createProfile(username: string, avatar?: ArrayBuffer) {
	return request<User>(`user`, 'POST', {
		icon: avatar ? [...new Uint8Array(avatar)] : undefined,
		username
	}, {
		authorization: `bearer ${get(page).data.session?.access_token}`
	});
}

export function request<T = any>(path: string, method: HttpMethod = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	return fetch(path.startsWith('http') ? path : `${API_BASE}/${path}`, {
		body: body ? JSON.stringify(body) : undefined,
		method,
		headers
	}).then(data => data.json().then(data => {
		if (data.error)
			return data;
		return { data };
	})).catch(() => ({
		error: true,
		error_id: 'UNKNOWN'
	}));
}