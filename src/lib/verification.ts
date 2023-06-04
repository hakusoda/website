import { request } from './api';
import { DISCORD_SECRET } from '$env/static/private';
import { PUBLIC_DISCORD_ID } from '$env/static/public';
export function getRobloxUserInfo(token: string, tokenType: string) {
	return request<RobloxUserInfoResponse>('https://apis.roblox.com/oauth/v1/userinfo', 'GET', null, {
		authorization: `${tokenType} ${token}`
	});
}

export function getDiscordAuthInfo(token: string, tokenType: string) {
	return request<DiscordAuthInfoResponse>('https://discord.com/api/v10/oauth2/@me', 'GET', null, {
		authorization: `${tokenType} ${token}`
	});
}

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
export interface DiscordAuthInfoResponse {
	user: {
		id: string
		avatar: string
		username: string
		global_name: string
		public_flags: number
		discriminator: string
		avatar_decoration: string
	}
	scopes: string[]
	expires: string
	application: {
		id: string
		type: null
		name: string
		icon: string
		hook: boolean
		flags: number
		summary: string
		verify_key: string
		bot_public: boolean
		description: string
		bot_require_code_grant: boolean
	}
}

export interface RobloxUserInfoResponse {
	sub: string
}