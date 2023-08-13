import { MELLOW_TOKEN } from '$env/static/private';

import { request } from './api';
import type { DiscordRole, DiscordMember, DiscordChannel } from './types';
export function getDiscordServerRoles(serverId: string) {
	return request<DiscordRole[]>(`https://discord.com/api/v10/guilds/${serverId}/roles`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

export function getDiscordServerChannels(serverId: string) {
	return request<DiscordChannel[]>(`https://discord.com/api/v10/guilds/${serverId}/channels`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	}).then(response => response.success ? response.data : []);
}

export function getDiscordServerMembers(serverId: string, limit: number) {
	return request<DiscordMember[]>(`https://discord.com/api/v10/guilds/${serverId}/members?limit=${limit}`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	}).then(response => response.success ? response.data : []);
}

export function searchDiscordServerMembers(serverId: string, query: string, limit: number) {
	return request<DiscordMember[]>(`https://discord.com/api/v10/guilds/${serverId}/members/search?query=${encodeURIComponent(query)}&limit=${limit}`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	}).then(response => response.success ? response.data : []);
}