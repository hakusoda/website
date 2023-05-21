import { get } from 'svelte/store';
import { page } from '$app/stores';
import type { HttpMethod } from '@sveltejs/kit/types/private';

import type { User, ApiResponse } from './types';
export const API_BASE = 'https://api.voxelified.com/v1';

export function getUser(userId: string) {
	return request<User>(`user/${userId}`).then(response => {
		if (response.error)
			return null;
		return response.data;
	});
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
	return fetch(`${API_BASE}/${path}`, {
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