import { MELLOW_TOKEN } from '$env/static/private';

import { request } from './util';
import type { DiscordRole, DiscordServer, DiscordChannel } from './types';
export function getDiscordServer(serverId: string) {
	return request<DiscordServer>(`https://discord.com/api/v10/guilds/${serverId}`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

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