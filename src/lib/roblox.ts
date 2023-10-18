import { request } from './util';
//import { ROBLOX_OPEN_CLOUD_KEY } from '$env/static/private';
//import { OpenCloudClient, OpenCloudApiKey } from '../../../../../source/repos/roblox-open-cloud';
import type { RobloxUserProfile, RobloxGetGroupsResponse, RobloxGroupRolesResponse, RobloxThumbnailsResponse, RobloxLookupGroupsResponse } from './types';

//const openCloud = new OpenCloudClient(new OpenCloudApiKey(ROBLOX_OPEN_CLOUD_KEY));
export function getRobloxUsers(userIds: (string | number)[]) {
	if (!userIds.length)
		return Promise.resolve([]);
	return request<{ profileDetails: RobloxUserProfile[] }>('https://apis.roblox.com/user-profile-api/v1/user/profiles/get-profiles', 'POST', {
		fields: ['names.username', 'names.combinedName'],
		userIds: [...new Set(userIds)]
	}, {
		'content-type': 'application/json'
	}).then(response => response.success ? response.data.profileDetails : []);
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