import { PUBLIC_DISCORD_ID } from '$env/static/public';
import { MELLOW_TOKEN, DISCORD_SECRET } from '$env/static/private';

import { request } from '../shared/util';
import { UserConnectionKind } from '../shared/enums';
import supabase, { handle_response } from './supabase';
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

export function get_discord_server_member(server_id: string, user_id: string) {
	return request<DiscordMember>(`https://discord.com/api/v10/guilds/${server_id}/members/${user_id}`, 'GET', null, {
		authorization: `Bot ${MELLOW_TOKEN}`
	});
}

export async function get_discord_server_member_from_platform_user(server_id: string, user_id: string): Promise<DiscordMember | null> {
	const response = handle_response(await supabase.from('user_connections')
		.select('sub')
		.eq('type', UserConnectionKind.Discord)
		.eq('user_id', user_id)
		.limit(1)
		.maybeSingle()
	);
	if (!response.data)
		return null;

	return get_discord_server_member(server_id, response.data.sub)
		.then(response => response.success ? response.data : null);
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

export interface DiscordMember {

}

export interface DiscordTokenResponse {
	scope: string
	expires_in: number
	token_type: string
	access_token: string
	refresh_token: string
}