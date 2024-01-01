import { get } from 'svelte/store';

import { page } from '$app/stores';
import { request } from './util';
import type {
	User,
	Pagination,
	ActionLogItem,
	UpdateTeamPayload,
	CreateTeamResponse,
	VerifySignInPayload,
	VerifySignUpPayload,
	VerifySignUpResponse,
	UpdateProfilePayload,
	UpdateTeamRolePayload,
	CreateUserPostPayload,
	VerifySudoModePayload,
	CreateUserPostResponse,
	VerifyNewDevicePayload,
	UpdateTeamMemberPayload,
	GetSignUpOptionsPayload,
	VerifyNewDeviceResponse,
	GenerateMellowServerApiKeyResponse,
	UpdateMellowServerOwnershipPayload,
	CreateMellowProfileSyncActionPayload,
	CreateMellowProfileSyncActionResponse,
	UpdateMellowUserServerSettingsPayload,
	UpdateMellowServerProfileSyncingSettingsPayload
} from './types';

export function createProfile(username: string) {
	return request<User>(`user`, 'POST', { username });
}

export function updateProfile(payload: UpdateProfilePayload) {
	return request(`user`, 'PATCH', payload);
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

export function getTeamActionLog(teamId: string, limit = 20, offset = 0) {
	return request<Pagination<ActionLogItem>>(`team/${teamId}/action_log?limit=${limit}&offset=${offset}`);
}

export function createTeam(displayName: string) {
	return request<CreateTeamResponse>('team', 'POST', {
		display_name: displayName
	});
}

export function updateTeam(teamId: string, payload: UpdateTeamPayload) {
	return request(`team/${teamId}`, 'PATCH', payload);
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
	return request(`team/${teamId}/member/${userId}`, 'PATCH', payload);
}

export function updateTeamRole(teamId: string, roleId: string, payload: UpdateTeamRolePayload) {
	return request(`team/${teamId}/role/${roleId}`, 'PATCH', payload);
}

export function createUserPost(userId: string, payload: CreateUserPostPayload) {
	return request<CreateUserPostResponse>(`user/${userId}/post`, 'POST', payload);
}

export function createChildPost(postId: string, payload: CreateUserPostPayload) {
	return request<CreateUserPostResponse>(`post/${postId}/reply`, 'POST', payload);
}

export function likePost(postId: string) {
	return request(`post/${postId}/like`, 'POST');
}

export function unlikePost(postId: string) {
	return request(`post/${postId}/like`, 'DELETE');
}

export async function uploadPostAttachment([image, contentType]: [ArrayBuffer, string]) {
	const { session, supabase } = get(page).data;

	const bucket = supabase!.storage.from('post_attachments');
	const response = await bucket
		.upload(`${(await session)!.user.id}/${crypto.randomUUID()}`, image, {
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

export function getMellowServerActionLog(serverId: string, limit = 20, offset = 0) {
	return request<Pagination<ActionLogItem>>(`mellow/server/${serverId}/action_log?limit=${limit}&offset=${offset}`);
}

export function updateMellowUserServerSettings(serverId: string, payload: UpdateMellowUserServerSettingsPayload) {
	return request(`mellow/server/${serverId}/user-settings`, 'PATCH', payload);
}

export function updateMellowServerOwnership(serverId: string, payload: UpdateMellowServerOwnershipPayload) {
	return request(`mellow/server/${serverId}/ownership`, 'PATCH', payload);
}

export function updateMellowServerProfileSyncingSettings(serverId: string, payload: UpdateMellowServerProfileSyncingSettingsPayload) {
	return request<CreateMellowProfileSyncActionResponse>(`mellow/server/${serverId}/syncing/settings`, 'PATCH', payload);
}

export function createMellowServerProfileSyncAction(serverId: string, payload: CreateMellowProfileSyncActionPayload) {
	return request<CreateMellowProfileSyncActionResponse>(`mellow/server/${serverId}/syncing/action`, 'POST', payload);
}

export function updateMellowServerProfileSyncAction(serverId: string, linkId: string, payload: Partial<CreateMellowProfileSyncActionPayload>) {
	return request<CreateMellowProfileSyncActionResponse>(`mellow/server/${serverId}/syncing/action/${linkId}`, 'PATCH', payload);
}

export function deleteMellowServerProfileSyncAction(serverId: string, linkId: string) {
	return request<CreateMellowProfileSyncActionResponse>(`mellow/server/${serverId}/syncing/action/${linkId}`, 'DELETE');
}

export function generateMellowServerApiKey(serverId: string) {
	return request<GenerateMellowServerApiKeyResponse>(`mellow/server/${serverId}/api-key`, 'POST');
}

export function getSignUpOptions(payload: GetSignUpOptionsPayload) {
	return request<PublicKeyCredentialCreationOptions>('auth/sign-up/options', 'POST', payload);
}

export async function verifySignUp(payload: VerifySignUpPayload) {
	return request<VerifySignUpResponse>('auth/sign-up/verify', 'POST', { ...payload, platform_version: await getPlatformVersion() });
}

export function getSignInOptions(payload: GetSignUpOptionsPayload) {
	return request<PublicKeyCredentialRequestOptions>('auth/sign-in/options', 'POST', payload);
}

export async function verifySignIn(payload: VerifySignInPayload) {
	return request<VerifySignUpResponse>('auth/sign-in/verify', 'POST', { ...payload, platform_version: await getPlatformVersion() });
}

export function getNewDeviceOptions() {
	return request<PublicKeyCredentialCreationOptions>('auth/device/options');
}

export async function verifyNewDevice(payload: VerifyNewDevicePayload) {
	return request<VerifyNewDeviceResponse>('auth/device/verify', 'POST', { ...payload, platform_version: await getPlatformVersion() });
}

export function getSudoModeOptions() {
	return request<PublicKeyCredentialRequestOptions>('auth/sudo/options');
}

export async function verifySudoMode(payload: VerifySudoModePayload) {
	return request<VerifyNewDeviceResponse>('auth/sudo/verify', 'POST', payload);
}

export function removeSecurityDevice(deviceId: string) {
	return request(`user/${get(page).data.session.sub}/security/device/${encodeURIComponent(deviceId)}`, 'DELETE');
}

export function removeUserConnection(connectionId: string) {
	return request(`user/${get(page).data.session.sub}/connection/${connectionId}`, 'DELETE');
}

export function followUser(userId: string) {
	return request(`user/${userId}/follow`, 'POST');
}

export function unfollowUser(userId: string) {
	return request(`user/${userId}/follow`, 'DELETE');
}

export function authoriseApplication(application_id: string, redirect_uri: string) {
	return request<{ redirect_uri: string }>('auth/authorisations', 'POST', {
		scopes: [{ type: 'openid', operations: ['read'] }],
		redirect_uri,
		application_id
	});
}

export function revokeApplication(authorisation_id: string) {
	return request(`auth/authorisation/${authorisation_id}`, 'DELETE');
}

function getPlatformVersion() {
	const { userAgentData } = navigator;
	if (userAgentData)
		return userAgentData.getHighEntropyValues(['platformVersion'])
			.then(data => data.platformVersion || '10.0.0');
	return Promise.resolve('10.0.0');
}