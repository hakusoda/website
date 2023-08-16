import { UserNotificationType } from '$lib/enums';
import type { UserNotification } from '../types';
export function getDefaultAvatar(id: string) {
	let hash = 0;
	for (let i = 0; i < id.length; i++)
		hash = id.charCodeAt(i) + ((hash << 5) - hash);
	hash = Math.abs(hash);

	return `/img/avatar/default_${Math.floor(hash % 6) + 1}.svg`;
}

export function createDiscordRedirectUri(origin: string) {
	return `${origin}/roblox/verify/platform/discord`;
}

export function createMellowServerDiscordRedirectUrl(origin: string) {
	return `${origin}/settings/mellow/servers`;
}

export function createUserConnectionsDiscordRedirectUrl(origin: string) {
	return `${origin}/settings/account/connections`;
}

export function getUserNotificationUrl({ type, target_user, target_team }: UserNotification) {
	if (type === UserNotificationType.RobloxAccountRemoved)
		return '/settings/roblox/accounts'
	if (target_team)
		return `/team/${target_team.name}`;
	if (target_user)
		return `/user/${target_user.username}`;
	return '';
}

export const uuidRegex = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;

export const isUUID = (uuid: string) => uuidRegex.test(uuid);
export const hasBit = (bits: number, bit: number) => (bits & bit) === bit;