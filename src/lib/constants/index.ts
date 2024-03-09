import { createOAuthLink } from '@voxelified/roblox-open-cloud';
import type { SvelteComponent } from 'svelte';

import { PUBLIC_API_BASE, PUBLIC_GITHUB_ID, PUBLIC_ROBLOX_ID } from '$env/static/public';
import { UserConnectionType, MellowProfileSyncActionType, MellowProfileSyncActionRequirementType } from '../enums';

import X from 'virtual:icons/bi/x-lg';
import Link from 'virtual:icons/bi/link-45deg';
import GitHub from '../icons/GitHub.svelte';
import Discord from '../icons/Discord.svelte';
import BrandIcon from '../icons/BrandIcon.svelte';
import PersonFill from 'virtual:icons/bi/person-fill';
import PeopleFill from 'virtual:icons/bi/people-fill';
import RobloxIcon from '../icons/RobloxIcon.svelte';
import YouTubeIcon from '../icons/YouTubeIcon.svelte';
import PersonXFill from 'virtual:icons/bi/person-x-fill';
import BoxArrowRight from 'virtual:icons/bi/box-arrow-right';
import ArrowLeftRight from 'virtual:icons/bi/arrow-left-right';
import PersonBadgeFill from 'virtual:icons/bi/person-badge-fill';
import PersonLinesFill from 'virtual:icons/bi/person-lines-fill';
import SignpostSplitFill from 'virtual:icons/bi/signpost-split-fill';
export const THEMES = ['dark'] as const;
export const LOCALES = ['en-AU'] as const;

export const USERNAME_REGEX = /^[\w-]+$/;
export const DISPLAY_NAME_REGEX = /^[\w !@#$%^&*()-:;"'{}[\]?\\|~`<>]+$/;

export const API_BASE = PUBLIC_API_BASE || 'https://api.hakumi.cafe/v0';

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
		[MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange, ArrowLeftRight]/*,
		'separator',
		[MellowProfileSyncActionRequirementType.RobloxHaveAsset, Shop],
		[MellowProfileSyncActionRequirementType.RobloxHaveBadge, PatchCheckFill],
		[MellowProfileSyncActionRequirementType.RobloxHavePass, StarFill]*/
	], RobloxIcon],
	/*[[
		[MellowProfileSyncActionRequirementType.GitHubInOrganisation, PeopleFill]
	], GitHub],
	[[
		[MellowProfileSyncActionRequirementType.SteamInGroup, PeopleFill]
	], Steam],
	[[
		[MellowProfileSyncActionRequirementType.HAKUMIInTeam, PeopleFill]
	], BrandIcon],*/
	[[
		[MellowProfileSyncActionRequirementType.MeetOtherAction, Link]
	], BrandIcon]
];

export const MELLOW_SYNC_REQUIREMENT_CONNECTIONS: Record<MellowProfileSyncActionRequirementType, UserConnectionType | null> = {
	[MellowProfileSyncActionRequirementType.RobloxHaveConnection]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxHaveGroupRole]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxInGroup]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxBeFriendsWith]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.MeetOtherAction]: null,
	[MellowProfileSyncActionRequirementType.HAKUMIInTeam]: null,
	[MellowProfileSyncActionRequirementType.SteamInGroup]: null,
	[MellowProfileSyncActionRequirementType.RobloxHaveAsset]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxHaveBadge]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.RobloxHavePass]: UserConnectionType.Roblox,
	[MellowProfileSyncActionRequirementType.GitHubInOrganisation]: UserConnectionType.GitHub
};

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
	},
	[UserConnectionType.YouTube]: {
		url: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=934357807730-v456geqrn1fhuvtu42jg3fjel6ehv69m.apps.googleusercontent.com&redirect_uri=RD143&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.readonly',
		icon: YouTubeIcon,
		colour: 'red',
		manage_url: 'https://myaccount.google.com/u/1/connections/overview/AZcznIIig3dPSCdDKH_OWDBHq0_aOoZqUgKIEi-H3uxy0t3ux4plgDsCY_aP3yzV3wb4F4nW6AZOlUG0BGT9OJfcPpU'
	}
};

export const APPLICATION_OAUTH_SCOPE_TYPES = ['openid'] as const;
export const APPLICATION_OAUTH_SCOPE_OPERATIONS = ['read'] as const;

export const EVENT_RESPONSE_TREES = {
	'mellow.discord.member_join': {
		allowed_item_kinds: ['action.mellow.sync_profile', 'action.mellow.member.kick', 'statement.if']
	}
} as const;

export const EVENT_RESPONSE_ITEM_KINDS = {
	'action.mellow.sync_profile': {
		icon: PersonLinesFill,
		only_one: true
	},
	'action.mellow.member.kick': {
		icon: PersonXFill,
		only_one: true
	},
	'statement.if': {
		icon: SignpostSplitFill,
		only_one: false
	}
} as const;