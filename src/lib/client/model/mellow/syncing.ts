import type { SvelteComponent } from 'svelte';

import { UserConnectionKind } from '$lib/shared/enums';
import type { SyncAction, CriteriaItem, QuantifierKind, SyncActionKind, CriteriaItemKind } from '$lib/shared/types/mellow/syncing';
export function create_action_data(kind: SyncActionKind): SyncAction['action_data'] {
	if (kind === 'discord.member.assign_roles')
		return {
			role_ids: [],
			can_remove: true
		};
	else if (kind === 'discord.member.ban' || kind === 'discord.member.kick')
		return {
			reason: null,
			user_facing_details: null
		};
	return null;
}

export function create_criteria_item(kind: CriteriaItemKind): CriteriaItem {
	if (kind === 'roblox.group.membership.role.rank.in_range')
		return { kind, range_lower: 0, range_upper: 0 };
	if (kind === 'mellow.server.syncing.actions')
		return { kind, action_ids: [], quantifier: { kind: 'all' } };
	return { kind };
}

export function get_criteria_item_icon(kind: CriteriaItemKind): typeof SvelteComponent<any> | null {
	for (const category of UI_CRITERIA_ITEM_LIST)
		for (const item of category.items)
			if (item !== 'separator' && item.kind === kind)
				return item.icon;
	return null;
}

export function get_criteria_item_connection_kind(kind: CriteriaItemKind): UserConnectionKind | null {
	for (const category of UI_CRITERIA_ITEM_LIST)
		for (const item of category.items)
			if (item !== 'separator' && item.kind === kind)
				return category.connection_kind ?? null;
	return null;
}

export const SYNC_ACTION_KINDS: SyncAction['kind'][] = [
	'discord.member.assign_roles', 'discord.member.ban', 'discord.member.kick',
	//'visual_scripting.execute_document',
	'control_flow.cancel',
];

import Ban from 'virtual:icons/bi/ban';
import Escape from 'virtual:icons/bi/escape';
import Document from '$lib/ui/icons/Document.svelte';
import SignStopFill from 'virtual:icons/bi/sign-stop-fill';
import PersonLinesFill from 'virtual:icons/bi/person-lines-fill';
export const SYNC_ACTION_ICONS: Record<SyncActionKind, typeof SvelteComponent<any>> = {
	'control_flow.cancel': SignStopFill,
	'discord.member.assign_roles': PersonLinesFill,
	'discord.member.ban': Ban,
	'discord.member.kick': Escape,
	'visual_scripting.execute_document': Document
};

import Link from 'virtual:icons/bi/link-45deg';
import PeopleFill from 'virtual:icons/bi/people-fill';
import PersonFillCheck from 'virtual:icons/bi/person-fill-check';
export const UI_CRITERIA_ITEM_LIST: {
	items: ({
		kind: CriteriaItemKind
		icon: typeof SvelteComponent<any>
	} | 'separator')[],
	connection_kind?: UserConnectionKind
}[] = [{
	items: [{
		kind: 'roblox.group.membership',
		icon: PeopleFill
	}, {
		kind: 'roblox.group.membership.role',
		icon: PeopleFill
	}, {
		kind: 'roblox.group.membership.role.rank.in_range',
		icon: PeopleFill
	}],
	connection_kind: UserConnectionKind.Roblox
}, {
	items: [{
		kind: 'patreon.campaign.tier_subscription',
		icon: PersonFillCheck
	}],
	connection_kind: UserConnectionKind.Patreon
}, {
	items: [{
		kind: 'hakumi.user.connection',
		icon: PersonFillCheck
	}, {
		kind: 'mellow.server.syncing.actions',
		icon: Link
	}]
}];

export const QUANTIFIER_KINDS: QuantifierKind[] = [
	'all', 'at_least'
];

