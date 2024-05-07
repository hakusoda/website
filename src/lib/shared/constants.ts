import { createOAuthLink } from '@hakumi/roblox-open-cloud';
import type { SvelteComponent } from 'svelte';

import { UserConnectionKind } from './enums';
import { PUBLIC_API_BASE, PUBLIC_GITHUB_ID, PUBLIC_ROBLOX_ID } from '$env/static/public';

import GitHub from '../ui/icons/GitHub.svelte';
import Discord from '../ui/icons/Discord.svelte';
import Patreon from '../ui/icons/Patreon.svelte';
import RobloxIcon from '../ui/icons/RobloxIcon.svelte';
import YouTubeIcon from '../ui/icons/YouTubeIcon.svelte';
export const THEMES = ['dark'] as const;
export const LOCALES = ['en-AU'] as const;

export const UUID_REGEX = /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/;
export const USERNAME_REGEX = /^[\w-]+$/;
export const DISPLAY_NAME_REGEX = /^[\w !@#$%^&*()-:;"'{}[\]?\\|~`<>]+$/;

export const API_BASE = PUBLIC_API_BASE || 'https://api.hakumi.cafe/v0';

export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

export const USER_CONNECTION_METADATA: Record<UserConnectionKind, {
	url: string
	icon: typeof SvelteComponent<any>
	colour: string
	manage_url: string,
	icon_colour?: string,
	text_colour?: string
}> = {
	[UserConnectionKind.Discord]: {
		url: `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=RD143&response_type=code&scope=identify`,
		icon: Discord,
		colour: '#5865F2',
		manage_url: 'https://discord.com/settings/authorized-apps'
	},
	[UserConnectionKind.GitHub]: {
		url: `https://github.com/login/oauth/authorize?client_id=${PUBLIC_GITHUB_ID}&redirect_uri=RD143`,
		icon: GitHub,
		colour: '#333',
		manage_url: `https://github.com/settings/connections/applications/${PUBLIC_GITHUB_ID}`
	},
	[UserConnectionKind.Roblox]: {
		url: createOAuthLink(PUBLIC_ROBLOX_ID as any, 'RD143', 'openid profile'),
		icon: RobloxIcon,
		colour: '#000',
		manage_url: 'https://www.roblox.com/my/account#!/app-permissions'
	},
	[UserConnectionKind.YouTube]: {
		url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=934357807730-v456geqrn1fhuvtu42jg3fjel6ehv69m.apps.googleusercontent.com&redirect_uri=RD143&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly',
		icon: YouTubeIcon,
		colour: 'red',
		manage_url: 'https://myaccount.google.com/u/1/connections/overview/AZcznIIig3dPSCdDKH_OWDBHq0_aOoZqUgKIEi-H3uxy0t3ux4plgDsCY_aP3yzV3wb4F4nW6AZOlUG0BGT9OJfcPpU'
	},
	[UserConnectionKind.Patreon]: {
		url: 'https://www.patreon.com/oauth2/authorize?client_id=BaKp_8PIeBxx0cfJoEEaVxVQMxD3c_IUFS_qCSu5gNFnXLL5c4Qw4YMPtgMJG-n9&redirect_uri=RD143&scope=identity%20identity.memberships&response_type=code',
		icon: Patreon,
		colour: '#fff',
		manage_url: '',
		icon_colour: '#000',
		text_colour: '#000'
	}
};

export const APPLICATION_OAUTH_SCOPE_TYPES = ['openid'] as const;
export const APPLICATION_OAUTH_SCOPE_OPERATIONS = ['read'] as const;