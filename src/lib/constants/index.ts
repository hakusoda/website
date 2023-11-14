import { createOAuthLink } from '@voxelified/roblox-open-cloud';
import type { SvelteComponent } from 'svelte';

import { PUBLIC_API_BASE, PUBLIC_GITHUB_ID, PUBLIC_ROBLOX_ID } from '$env/static/public';
import { UserConnectionType, MellowProfileSyncActionType, MellowProfileSyncActionRequirementType } from '../enums';

import X from '../icons/X.svelte';
import Link from '../icons/Link.svelte';
import Shop from '../icons/Shop.svelte';
import Steam from '../icons/Steam.svelte';
import GitHub from '../icons/GitHub.svelte';
import Discord from '../icons/Discord.svelte';
import StarFill from '../icons/StarFill.svelte';
import BrandIcon from '../icons/BrandIcon.svelte';
import PersonFill from '../icons/PersonFill.svelte';
import PeopleFill from '../icons/PeopleFill.svelte';
import RobloxIcon from '../icons/RobloxIcon.svelte';
import BoxArrowRight from '../icons/BoxArrowRight.svelte';
import ArrowLeftRight from '../icons/ArrowLeftRight.svelte';
import PatchCheckFill from '../icons/PatchCheckFill.svelte';
import PersonBadgeFill from '../icons/PersonBadgeFill.svelte';
export const THEMES = ['dark', 'light', 'color_purple'] as const;
export const LOCALES = ['en-AU', 'ja-JP'] as const;

export const USERNAME_REGEX = /^[\w-]+$/;
export const DISPLAY_NAME_REGEX = /^[\w !@#$%^&*()-:;"'{}[\]?\\|~`<>]+$/;

export const API_BASE = PUBLIC_API_BASE || 'https://api.voxelified.com/v1';

export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

export const MELLOW_PROFILE_ACTION_DEFAULT_METADATA: Record<MellowProfileSyncActionType, any> = {
	[MellowProfileSyncActionType.GiveRoles]: {
		items: [],
		can_remove: true
	},
	[MellowProfileSyncActionType.BanFromServer]: {
		audit_log_reason: null,
		user_facing_reason: null,
		delete_messages_seconds: 0
	},
	[MellowProfileSyncActionType.KickFromServer]: {
		audit_log_reason: null,
		user_facing_reason: null
	},
	[MellowProfileSyncActionType.CancelSync]: {
		user_facing_reason: null
	}
}

export const MAPPED_MELLOW_SYNC_ACTION_ICONS: Record<MellowProfileSyncActionType, typeof SvelteComponent<any>> = {
	[MellowProfileSyncActionType.GiveRoles]: PersonBadgeFill,
	[MellowProfileSyncActionType.BanFromServer]: BoxArrowRight,
	[MellowProfileSyncActionType.KickFromServer]: BoxArrowRight,
	[MellowProfileSyncActionType.CancelSync]: X
};

export const MAPPED_MELLOW_SYNC_REQUIREMENTS: [([MellowProfileSyncActionRequirementType, typeof SvelteComponent<any>] | 'separator')[], typeof SvelteComponent<any>][] = [
	[[
		[MellowProfileSyncActionRequirementType.RobloxHaveConnection, PersonFill],
		'separator',
		[MellowProfileSyncActionRequirementType.RobloxInGroup, PeopleFill],
		[MellowProfileSyncActionRequirementType.RobloxHaveGroupRole, PersonBadgeFill],
		[MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange, ArrowLeftRight],
		'separator',
		[MellowProfileSyncActionRequirementType.RobloxHaveAsset, Shop],
		[MellowProfileSyncActionRequirementType.RobloxHaveBadge, PatchCheckFill],
		[MellowProfileSyncActionRequirementType.RobloxHavePass, StarFill]
	], RobloxIcon],
	[[
		[MellowProfileSyncActionRequirementType.GitHubInOrganisation, PeopleFill]
	], GitHub],
	[[
		[MellowProfileSyncActionRequirementType.SteamInGroup, PeopleFill]
	], Steam],
	[[
		[MellowProfileSyncActionRequirementType.HAKUMIInTeam, PeopleFill]
	], BrandIcon],
	[[
		[MellowProfileSyncActionRequirementType.MeetOtherAction, Link]
	], BrandIcon]
];

export const USER_CONNECTION_METADATA: Record<UserConnectionType, {
	url: string
	icon: typeof SvelteComponent<any>
	colour: string
	manage_url: string
}> = {
	[UserConnectionType.Discord]: {
		url: `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=RD143&response_type=code&scope=identify`,
		icon: Discord,
		colour: '#5865F2',
		manage_url: 'https://discord.com/settings/authorized-apps'
	},
	[UserConnectionType.GitHub]: {
		url: `https://github.com/login/oauth/authorize?client_id=${PUBLIC_GITHUB_ID}&redirect_uri=RD143`,
		icon: GitHub,
		colour: '#333',
		manage_url: `https://github.com/settings/connections/applications/${PUBLIC_GITHUB_ID}`
	},
	[UserConnectionType.Roblox]: {
		url: createOAuthLink(PUBLIC_ROBLOX_ID as any, 'RD143', 'openid profile'),
		icon: RobloxIcon,
		colour: '#000',
		manage_url: 'https://www.roblox.com/my/account#!/app-permissions'
	}
};

export const APPLICATION_OAUTH_SCOPE_TYPES = ['openid'] as const;
export const APPLICATION_OAUTH_SCOPE_OPERATIONS = ['read'] as const;