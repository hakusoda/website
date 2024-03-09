import { PUBLIC_DISCORD_ID } from '$env/static/public';
import { MELLOW_TOKEN, DISCORD_SECRET } from '$env/static/private';

import { request } from '../shared/util';
import type { DiscordRole, DiscordServer, DiscordChannel } from '../shared/types';
export function getDiscordServer(server_id: string) {
	return request<DiscordServer>(`https://discord.com/api/v10/guilds/${server_id}`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

export function getDiscordServerRoles(server_id: string) {
	return request<DiscordRole[]>(`https://discord.com/api/v10/guilds/${server_id}/roles`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

export function getDiscordServerChannels(server_id: string) {
	return request<DiscordChannel[]>(`https://discord.com/api/v10/guilds/${server_id}/channels`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	}).then(response => response.success ? response.data : []);
}

export function get_discord_token(code: string, redirect_uri: string) {
	const params = new URLSearchParams();
	params.set('code', code);
	params.set('client_id', PUBLIC_DISCORD_ID);
	params.set('grant_type', 'authorization_code');
	params.set('redirect_uri', redirect_uri);
	params.set('client_secret', DISCORD_SECRET);

	return request<DiscordTokenResponse>('https://discord.com/api/v10/oauth2/token', 'POST', params, {
		'content-type': 'application/x-www-form-urlencoded'
	});
}

export interface DiscordTokenResponse {
	scope: string
	expires_in: number
	token_type: string
	access_token: string
	refresh_token: string
}