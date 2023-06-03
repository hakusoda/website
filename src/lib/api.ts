import type { User, RobloxUser, ApiResponse } from './types';
export const API_BASE = 'https://api.voxelified.com/v1';

export function getUser(userId: string) {
	return request<User>(`user/${userId}`).then(response => response.error ? null : response.data);
}

export function getRobloxUsers(userIds: (string | number)[]) {
	return request<{ data: RobloxUser[] }>(`https://users.roblox.com/v1/users`, 'POST', {
		userIds,
		excludeBannedUsers: false
	}).then(response => response.error ? [] : response.data.data);
}

export function getRobloxAvatars(userIds: (string | number)[], size: '48x48' | '150x150' = '48x48') {
	return request<{ data: { state: string, targetId: number, imageUrl: string }[] }>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(',')}&format=Png&size=${size}`)
		.then(response => response.error ? [] : response.data.data.map(i => i.imageUrl))
}

export function createProfile(token: string, username: string, avatar?: ArrayBuffer) {
	return request<User>(`user`, 'POST', {
		icon: avatar ? [...new Uint8Array(avatar)] : undefined,
		username
	}, {
		authorization: `bearer ${token}`
	});
}

export function request<T = any>(path: string, method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	return fetch(path.startsWith('http') ? path : `${API_BASE}/${path}`, {
		body: body ? body instanceof URLSearchParams ? body.toString() : JSON.stringify(body) : undefined,
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