import { request } from './util';
import { DISCORD_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_ID } from '$env/static/public';
export function getDiscordToken(code: string, redirect_uri: string) {
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