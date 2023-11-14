import { MELLOW_TOKEN } from '$env/static/private';

import { request } from './util';
import type { DiscordRole, DiscordChannel } from './types';
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