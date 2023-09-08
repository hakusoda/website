import { get } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

import { page } from '$app/stores';
import { RequestErrorType } from './enums';
import type { User, RobloxUser, ApiResponse, PartialRobloxUser, UpdateTeamPayload, CreateTeamResponse, UpdateProfilePayload, UpdateTeamRolePayload, CreateUserPostPayload, CreateUserPostResponse, UpdateTeamMemberPayload, RobloxGetGroupsResponse, RobloxGroupRolesResponse, RobloxThumbnailsResponse, RobloxLookupGroupsResponse, CreateMellowServerRobloxLinkPayload, CreateMellowServerRobloxLinkResponse } from './types';
export const API_BASE = 'https://api.voxelified.com/v1';
//export const API_BASE = 'http://localhost:5174/v1';

export function getUser(userId: string) {
	return request<User>(`user/${userId}`).then(response => response.success ? response.data : null);
}

export function getRobloxUser(userId: string | number) {
	return request<RobloxUser>(`https://users.roblox.com/v1/users/${userId}`)
		.then(response => response.success ? response.data : null);
}

export function getRobloxUsers(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{ data: PartialRobloxUser[] }>(`https://users.roblox.com/v1/users`, 'POST', {
		userIds,
		excludeBannedUsers: false
	}).then(response => response.success ? response.data.data : []);
}

export function getRobloxAvatars(userIds: (string | number)[], size: '48x48' | '150x150' = '48x48') {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{ data: { state: string, targetId: number, imageUrl: string }[] }>(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userIds.join(',')}&format=Png&size=${size}`)
		.then(response => response.success ? response.data.data : [])
}

export function getRobloxGroups(ids: (string | number)[]) {
	return request<RobloxGetGroupsResponse>(`https://groups.roblox.com/v2/groups?groupIds=${ids.join(',')}`)
		.then(response => response.success ? response.data.data : []);
}

export function lookupRobloxGroups(query: string) {
	return request<RobloxLookupGroupsResponse>(`https://groups.roblox.com/v1/groups/search/lookup?groupName=${query}`)
		.then(response => response.success ? response.data.data : []);
}

export function getRobloxGroupRoles(groupId: string | number) {
	return request<RobloxGroupRolesResponse>(`https://groups.roblox.com/v1/groups/${groupId}/roles`)
		.then(response => response.success ? response.data.roles : [])
}

export function getRobloxGroupAvatars(groupIds: (string | number)[], size: '150x150' | '420x420' = '150x150') {
	if (!groupIds.length)
		return Promise.resolve([]);
	return request<RobloxThumbnailsResponse>(`https://thumbnails.roblox.com/v1/groups/icons?groupIds=${groupIds.join(',')}&format=Png&size=${size}`)
		.then(response => response.success ? response.data.data : [])
}

export function createProfile(username: string) {
	return request<User>(`user`, 'POST', { username });
}

export function updateProfile(payload: UpdateProfilePayload) {
	return request(`user`, 'PATCH', payload, {
		'content-type': 'application/json'
	});
}

export function uploadAvatar(userId: string, newAvatar: ArrayBuffer) {
	return request(`user/${userId}/icon`, 'PATCH', newAvatar, {
		'content-type': 'image/webp'
	});
}

export function markNotificationAsRead(userId: string, notificationId: string) {
	return request(`user/${userId}/notification/${notificationId}/read`, 'POST');
}

export function markAllNotificationsAsRead(userId: string) {
	return request(`user/${userId}/notifications/read`, 'POST');
}

export function clearAllNotifications(userId: string) {
	return request(`user/${userId}/notifications`, 'DELETE');
}

export function createTeam(displayName: string) {
	return request<CreateTeamResponse>('team', 'POST', {
		display_name: displayName
	}, {
		'content-type': 'application/json'
	});
}

export function updateTeam(teamId: string, payload: UpdateTeamPayload) {
	return request(`team/${teamId}`, 'PATCH', payload, {
		'content-type': 'application/json'
	});
}

export function leaveTeam(teamId: string) {
	return request(`team/${teamId}/member`, 'DELETE');
}

export function uploadTeamAvatar(teamId: string, newAvatar: ArrayBuffer) {
	return request(`team/${teamId}/icon`, 'PATCH', newAvatar, {
		'content-type': 'image/webp'
	});
}

export function createTeamInvite(teamId: string, userId: string) {
	return request(`team/${teamId}/invite`, 'POST', { user_id: userId });
}

export function acceptTeamInvite(teamId: string, inviteId: string) {
	return request(`team/${teamId}/invite/${inviteId}`, 'PATCH');
}

export function rejectTeamInvite(teamId: string, inviteId: string) {
	return request(`team/${teamId}/invite/${inviteId}`, 'DELETE');
}

export function updateTeamMember(teamId: string, userId: string, payload: UpdateTeamMemberPayload) {
	return request(`team/${teamId}/member/${userId}`, 'PATCH', payload, {
		'content-type': 'application/json'
	});
}

export function updateTeamRole(teamId: string, roleId: string, payload: UpdateTeamRolePayload) {
	return request(`team/${teamId}/role/${roleId}`, 'PATCH', payload, {
		'content-type': 'application/json'
	});
}

export function createUserPost(userId: string, payload: CreateUserPostPayload) {
	return request<CreateUserPostResponse>(`user/${userId}/post`, 'POST', payload, {
		'content-type': 'application/json'
	});
}

export function createChildPost(postId: string, payload: CreateUserPostPayload) {
	return request<CreateUserPostResponse>(`posts/${postId}/reply`, 'POST', payload, {
		'content-type': 'application/json'
	});
}

export async function uploadPostAttachment([image, contentType]: [ArrayBuffer, string]) {
	const { session, supabase } = get(page).data;

	const bucket = supabase!.storage.from('post_attachments');
	const response = await bucket
		.upload(`${(await session)!.user.id}/${uuidv4()}`, image, {
			contentType
		});
	if (response.error)
		throw response.error;

	return {
		url: bucket.getPublicUrl(response.data.path).data.publicUrl
	};
}

export function uploadPostAttachments(images: [ArrayBuffer, string][]) {
	return Promise.all(images.map(image => uploadPostAttachment(image)));
}

export function createMellowServerProfileSyncAction(serverId: string, payload: CreateMellowServerRobloxLinkPayload) {
	return request<CreateMellowServerRobloxLinkResponse>(`mellow/server/${serverId}/roblox/link`, 'POST', payload, {
		'content-type': 'application/json'
	});
}

export function updateMellowServerProfileSyncAction(serverId: string, linkId: string, payload: Partial<CreateMellowServerRobloxLinkPayload>) {
	return request<CreateMellowServerRobloxLinkResponse>(`mellow/server/${serverId}/roblox/link/${linkId}`, 'PATCH', payload, {
		'content-type': 'application/json'
	});
}

export function deleteMellowServerProfileSyncAction(serverId: string, linkId: string) {
	return request<CreateMellowServerRobloxLinkResponse>(`mellow/server/${serverId}/roblox/link/${linkId}`, 'DELETE', null, {
		'content-type': 'application/json'
	});
}

const UNKNOWN_ERROR = { error: RequestErrorType.Unknown, success: false }
export async function request<T = any>(path: string, method: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
	const isExternal = path.startsWith('http');
	return fetch(isExternal ? path : `${API_BASE}/${path}`, {
		body: body ? body instanceof URLSearchParams ? body.toString() : body instanceof ArrayBuffer ? body : JSON.stringify(body) : undefined,
		method,
		headers: {
			...(!isExternal ? {
				authorization: `Bearer ${(await get(page).data.session)?.access_token}`
			} : {}),
			...headers
		}
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