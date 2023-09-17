import type { SvelteComponent } from 'svelte';

import { PUBLIC_GITHUB_ID } from '$env/static/public';
import { MellowProfileSyncActionType, MellowProfileSyncActionRequirementType } from '../enums';

import X from '../icons/X.svelte';
import Link from '../icons/Link.svelte';
import Steam from '../icons/Steam.svelte';
import PersonFill from '../icons/PersonFill.svelte';
import PeopleFill from '../icons/PeopleFill.svelte';
import RobloxIcon from '../icons/RobloxIcon.svelte';
import Voxelified from '../icons/Voxelified.svelte';
import BoxArrowRight from '../icons/BoxArrowRight.svelte';
import ArrowLeftRight from '../icons/ArrowLeftRight.svelte';
import PersonBadgeFill from '../icons/PersonBadgeFill.svelte';
export const THEMES = ['dark', 'light', 'color_purple'] as const;
export const LOCALES = ['en-AU', 'ja-JP'] as const;

export const USERNAME_REGEX = /^[\w-]+$/;
export const DISPLAY_NAME_REGEX = /^[\w !@#$%^&*()-:;"'{}[\]?\\|~`<>]+$/;

export const API_BASE = 'https://api.voxelified.com/v1';
//export const API_BASE = 'https://api-dev-tunnel.voxelified.com/v1';

export const EMPTY_UUID = '00000000-0000-0000-0000-000000000000';

export const MAPPED_MELLOW_SYNC_ACTION_ICONS: Record<MellowProfileSyncActionType, typeof SvelteComponent<any>> = {
	[MellowProfileSyncActionType.DiscordRoles]: PersonBadgeFill,
	[MellowProfileSyncActionType.BanDiscord]: BoxArrowRight,
	[MellowProfileSyncActionType.KickDiscord]: BoxArrowRight,
	[MellowProfileSyncActionType.CancelSync]: X
};

export const MAPPED_MELLOW_SYNC_REQUIREMENTS: [[MellowProfileSyncActionRequirementType, typeof SvelteComponent<any>][], typeof SvelteComponent<any>][] = [
	[[
		[MellowProfileSyncActionRequirementType.RobloxHasVerifiedAccount, PersonFill],
		[MellowProfileSyncActionRequirementType.RobloxInGroup, PeopleFill],
		[MellowProfileSyncActionRequirementType.RobloxHasGroupRole, PersonBadgeFill],
		[MellowProfileSyncActionRequirementType.RobloxHasGroupRankInRange, ArrowLeftRight]
	], RobloxIcon],
	[[
		[MellowProfileSyncActionRequirementType.SteamInGroup, PeopleFill]
	], Steam],
	[[
		[MellowProfileSyncActionRequirementType.VoxelifiedInTeam, PeopleFill]
	], Voxelified],
	[[
		[MellowProfileSyncActionRequirementType.MeetOtherAction, Link]
	], Voxelified]
];

const redirectURI = encodeURIComponent(`${API_BASE}/auth/callback/`);
export const GITHUB_OAUTH_URL = `https://github.com/login/oauth/authorize?client_id=${PUBLIC_GITHUB_ID}&redirect_uri=${redirectURI}github`;
export const DISCORD_OAUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=${redirectURI}discord&response_type=code&scope=identify`;