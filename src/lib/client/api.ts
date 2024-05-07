import { get } from 'svelte/store';
import type { GroupRole } from '@hakumi/roblox-open-cloud';

import { page } from '$app/stores';
import { request } from '../shared/util';
import * as Mellow from '../shared/types/mellow';
import * as VisualScripting from '../shared/types/visual_scripting';
import type {
	MellowServer,
	CreateMellowServerCommandPayload,
	UpdateMellowServerLoggingPayload,
	UpdateMellowUserServerSettingsPayload
} from './types';
import type {
	Pagination,
	ActionLogItem,
	UpdateTeamPayload,
	CreateTeamResponse,
	VerifySignInPayload,
	VerifySignUpPayload,
	VerifySignUpResponse,
	UpdateProfilePayload,
	UpdateTeamRolePayload,
	VerifySudoModePayload,
	VerifyNewDevicePayload,
	UpdateTeamMemberPayload,
	GetSignUpOptionsPayload,
	VerifyNewDeviceResponse,
	CreateMellowWebhookPayload,
	GenerateMellowServerApiKeyResponse,
	UpdateMellowServerOwnershipPayload,
	UpdateMellowServerProfileSyncingSettingsPayload
} from '../shared/types';
import { get_auth_public_key } from './crypto';

const get_local_uid = (): string => get(page).data.session!.sub;

export function update_user_profile(payload: UpdateProfilePayload) {
	return request('user', 'PATCH', payload);
}

export function update_user_avatar(user_id: string, image_buffer: ArrayBuffer) {
	return request(`user/${user_id}/icon`, 'PATCH', image_buffer, {
		'content-type': 'image/webp'
	});
}

export function markNotificationAsRead(user_id: string, notification_id: string) {
	return request(`user/${user_id}/notification/${notification_id}/read`, 'POST');
}

export function markAllNotificationsAsRead(user_id: string) {
	return request(`user/${user_id}/notifications/read`, 'POST');
}

export function clearAllNotifications(user_id: string) {
	return request(`user/${user_id}/notifications`, 'DELETE');
}

export function getTeamActionLog(team_id: string, limit = 20, offset = 0) {
	return request<Pagination<ActionLogItem>>(`team/${team_id}/action_log?limit=${limit}&offset=${offset}`);
}

export function createTeam(display_name: string) {
	return request<CreateTeamResponse>('team', 'POST', { display_name });
}

export function updateTeam(team_id: string, payload: UpdateTeamPayload) {
	return request(`team/${team_id}`, 'PATCH', payload);
}

export function leaveTeam(team_id: string) {
	return request(`team/${team_id}/member`, 'DELETE');
}

export function update_team_avatar(team_id: string, image_buffer: ArrayBuffer) {
	return request(`team/${team_id}/icon`, 'PATCH', image_buffer, {
		'content-type': 'image/webp'
	});
}

export function createTeamInvite(team_id: string, user_id: string) {
	return request(`team/${team_id}/invite`, 'POST', { user_id });
}

export function acceptTeamInvite(team_id: string, invite_id: string) {
	return request(`team/${team_id}/invite/${invite_id}`, 'PATCH');
}

export function rejectTeamInvite(team_id: string, invite_id: string) {
	return request(`team/${team_id}/invite/${invite_id}`, 'DELETE');
}

export function updateTeamMember(team_id: string, user_id: string, payload: UpdateTeamMemberPayload) {
	return request(`team/${team_id}/member/${user_id}`, 'PATCH', payload);
}

export function removeTeamMember(team_id: string, user_id: string) {
	return request(`team/${team_id}/member/${user_id}`, 'DELETE');
}

export function updateTeamRole(team_id: string, role_id: string, payload: UpdateTeamRolePayload) {
	return request(`team/${team_id}/role/${role_id}`, 'PATCH', payload);
}

export function get_mellow_servers() {
	return request<MellowServer[]>('mellow/servers');
}

export function getMellowServerActionLog(server_id: string, limit = 20, offset = 0) {
	return request<Pagination<ActionLogItem>>(`mellow/server/${server_id}/action_log?limit=${limit}&offset=${offset}`);
}

export function update_mellow_user_server_settings(server_id: string, payload: UpdateMellowUserServerSettingsPayload) {
	return request(`mellow/server/${server_id}/user_settings`, 'PATCH', payload);
}

export function updateMellowServerOwnership(server_id: string, payload: UpdateMellowServerOwnershipPayload) {
	return request(`mellow/server/${server_id}/ownership`, 'PATCH', payload);
}

export function updateMellowServerProfileSyncingSettings(server_id: string, payload: UpdateMellowServerProfileSyncingSettingsPayload) {
	return request(`mellow/server/${server_id}/syncing/settings`, 'PATCH', payload);
}

// mellow commands
export function create_mellow_command(server_id: string, payload: CreateMellowServerCommandPayload) {
	return request(`mellow/server/${server_id}/commands`, 'POST', payload);
}

export function update_mellow_command(server_id: string, command_id: string, payload: Partial<CreateMellowServerCommandPayload>) {
	return request(`mellow/server/${server_id}/command/${command_id}`, 'PATCH', payload);
}

// mellow sync actions
export function create_mellow_sync_action(server_id: string, payload: Mellow.Syncing.SyncAction) {
	return request<Mellow.Syncing.InternalSyncAction>(`mellow/server/${server_id}/syncing/action`, 'POST', payload);
}

export function update_mellow_sync_action(server_id: string, action_id: string, payload: Partial<Mellow.Syncing.SyncAction>) {
	return request<Mellow.Syncing.InternalSyncAction>(`mellow/server/${server_id}/syncing/action/${action_id}`, 'PATCH', payload);
}

export function delete_mellow_sync_action(server_id: string, action_id: string) {
	return request(`mellow/server/${server_id}/syncing/action/${action_id}`, 'DELETE');
}

// mellow webhooks
export function create_mellow_server_webhook(server_id: string, payload: CreateMellowWebhookPayload) {
	return request(`mellow/server/${server_id}/webhook`, 'POST', payload);
}

export function update_mellow_server_webhook(server_id: string, webhook_id: string, payload: Partial<CreateMellowWebhookPayload>) {
	return request(`mellow/server/${server_id}/webhook/${webhook_id}`, 'PATCH', payload);
}

export function delete_mellow_server_webhook(server_id: string, webhook_id: string) {
	return request(`mellow/server/${server_id}/webhook/${webhook_id}`, 'DELETE');
}

// other
export function create_mellow_server_visual_scripting_document(server_id: string, payload: Omit<VisualScripting.Document, 'id' | 'created_by'>) {
	return request<VisualScripting.Document>(`mellow/server/${server_id}/visual_scripting/documents`, 'POST', payload);
}

export function update_mellow_server_logging(server_id: string, payload: UpdateMellowServerLoggingPayload) {
	return request(`mellow/server/${server_id}/automation/logging`, 'PATCH', payload);
}

export function send_mellow_syncing_auto_import_request(server_id: string, payload: Mellow.Syncing.AutoImportRequest) {
	return request<Mellow.Syncing.InternalSyncAction[]>(`mellow/server/${server_id}/syncing/actions/auto_import`, 'POST', payload);
}

export function get_roblox_group_roles_for_mellow_server(server_id: string, group_id: string | number) {
	return request<GroupRole[]>(`mellow/server/${server_id}/roblox/group/${group_id}/roles`);
}

export function generateMellowServerApiKey(server_id: string) {
	return request<GenerateMellowServerApiKeyResponse>(`mellow/server/${server_id}/api-key`, 'POST');
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

export function verifySudoMode(payload: VerifySudoModePayload) {
	return request<VerifyNewDeviceResponse>('auth/sudo/verify', 'POST', payload);
}

export function removeSecurityDevice(device_id: string) {
	return request(`user/${get_local_uid()}/security/device/${encodeURIComponent(device_id)}`, 'DELETE');
}

export function removeUserConnection(connection_id: string) {
	return request(`user/${get_local_uid()}/connection/${connection_id}`, 'DELETE');
}

export function followUser(user_id: string) {
	return request(`user/${user_id}/follow`, 'POST');
}

export function unfollowUser(user_id: string) {
	return request(`user/${user_id}/follow`, 'DELETE');
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

export async function recoverAccountViaLink(id: string) {
	return request(`auth/recover/link`, 'POST', {
		id,
		device_public_key: await get_auth_public_key()
	});
}

export function update_visual_scripting_document(document_id: string, payload: Partial<Omit<VisualScripting.Document, 'id' | 'created_by'>>) {
	return request(`visual_scripting/document/${document_id}`, 'PATCH', payload);
}

function getPlatformVersion() {
	const { userAgentData } = navigator;
	if (userAgentData)
		return userAgentData.getHighEntropyValues(['platformVersion'])
			.then(data => data.platformVersion || '10.0.0');
	return Promise.resolve('10.0.0');
}