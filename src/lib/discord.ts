import { request } from './api';
import { MELLOW_TOKEN } from '$env/static/private';

export function getDiscordServerRoles(serverId: string) {
	return request<DiscordRole[]>(`https://discord.com/api/v10/guilds/${serverId}/roles`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

export interface DiscordRole {
	id: string
	name: string
	icon: string | null
	flags: number
	color: number
	hoist: boolean
	managed: boolean
	position: number
	permissions: string
	mentionable: boolean
	description: string | null
	unicode_emoji: string | null
}