import type { Variable, MapVariable } from '../types/visual_scripting';
import type { Element, Document, ConditionKind } from '$lib/shared/types/visual_scripting';

import PersonFill from 'virtual:icons/bi/person-fill';

// is there a way to have this return the type associated with the provided kind?
export function create_visual_scripting_element(kind: Element['kind']): Element {
	const id = crypto.randomUUID();
	if (kind === 'statement.if')
		return {
			id,
			kind,
			blocks: [{
				items: [],
				conditions: [{
					kind: 'initial',
					inputs: []
				}]
			}]
		};
	if (kind === 'no_op.comment')
		return { id, kind, text: '' };
	if (kind === 'action.mellow.member.roles.assign' || kind === 'action.mellow.message.reply' || kind === 'action.mellow.message.reaction.create')
		return { id, kind, value: '', reference: { path: '' } };
	return { id, kind };
}

export function calculate_visual_scripting_element_size(item: Element, ignore_id?: string | null): number {
	let size = 52;
	if (item.kind === 'statement.if') {
		for (const sub_item of item.blocks[0].items)
			if (sub_item.id !== ignore_id)
				size += calculate_visual_scripting_element_size(sub_item);
		size += 104;
	} else if (item.kind === 'no_op.comment')
		size += 76;

	return size;
}

export function find_visual_scripting_element_by_id(items: Element[], target_id: string): [Element, Element[]] | null {
	for (const item of items)
		if (item.id === target_id)
			return [item, items];
		else if (item.kind === 'statement.if')
			for (const block of item.blocks) {
				const match = find_visual_scripting_element_by_id(block.items, target_id);
				if (match)
					return match;
			}
	return null;
}

export function get_applicable_conditions_for_visual_scripting_variable(variable: Variable): ConditionKind[] {
	if (!variable)
		return [];
	if (variable.kind === 'generic.string')
		return [
			'generic.is', 'generic.is_not',
			'iterable.contains', 'iterable.does_not_contain', 'iterable.begins_with', 'iterable.ends_with'
		];
	if (variable.kind === 'generic.list')
		return [
			'iterable.has_any_value', 'iterable.does_not_have_any_value', 'iterable.contains', 'iterable.does_not_contain', 'iterable.begins_with', 'iterable.ends_with'
		];
	return [];
}

const ALLOWANCE_BASELINE = [
	'no_op.comment', 'no_op.nothing',
	'statement.if'
] as Element['kind'][];
export function get_allowed_visual_scripting_element_kinds_for_document({ kind }: Document): Element['kind'][] {
	if (kind === 'mellow.discord_event.member_join' || kind === 'mellow.discord_event.member.completed_onboarding')
		return ['action.mellow.member.sync', 'action.mellow.member.ban', 'action.mellow.member.kick', 'action.mellow.member.roles.assign', ...ALLOWANCE_BASELINE];
	if (kind === 'mellow.discord_event.message_create')
		return ['action.mellow.member.ban', 'action.mellow.member.kick', 'action.mellow.message.reply', 'action.mellow.message.reaction.create', ...ALLOWANCE_BASELINE];
	return ALLOWANCE_BASELINE;
}

export function determine_visual_scripting_document_variables({ kind }: Document, target_item_id: string): MapVariable {
	const root_variable: MapVariable = {
		kind: 'generic.map',
		definition: {}
	};
	if (kind === 'mellow.discord_event.member_join' || kind === 'mellow.discord_event.member.completed_onboarding' || kind === 'mellow.discord_event.message_create')
		root_variable.definition.member = {
			kind: 'generic.map',
			definition: {
				id: {
					kind: 'generic.string',
					translation_key: 'mellow.member.id'
				},
				username: {
					kind: 'generic.string',
					translation_key: 'mellow.member.username'
				},
				avatar_url: {
					kind: 'generic.string',
					translation_key: 'mellow.member.avatar_url'
				},
				display_name: {
					kind: 'generic.string',
					translation_key: 'mellow.member.display_name'
				},
				roles: {
					kind: 'generic.list',
					definition: [],
					translation_key: 'mellow.member.roles'
				}
			},
			display_icon: PersonFill,
			translation_key: 'mellow.member'
		};
	if (kind === 'mellow.discord_event.message_create')
		root_variable.definition.message = {
			kind: 'generic.map',
			definition: {
				content: {
					kind: 'generic.string',
					translation_key: 'mellow.message.content'
				}
			},
			translation_key: 'mellow.message'
		};
	return root_variable;
}

import ReplyFill from 'virtual:icons/bi/reply-fill';
import PeopleFill from 'virtual:icons/bi/people-fill';
import JustifyLeft from 'virtual:icons/bi/justify-left';
import PersonXFill from 'virtual:icons/bi/person-x-fill';
import SquareDotted from '$lib/ui/icons/SquareDotted.svelte';
import PersonLinesFill from 'virtual:icons/bi/person-lines-fill';
import SignpostSplitFill from 'virtual:icons/bi/signpost-split-fill';
export const VISUAL_SCRIPTING_ELEMENT_KINDS = {
	'action.mellow.member.sync': {
		icon: PersonLinesFill,
		colour: 'var(--button-background)',
		only_one: true
	},
	'action.mellow.member.ban': {
		icon: PersonXFill,
		colour: '#e06c6c',
		only_one: true
	},
	'action.mellow.member.kick': {
		icon: PersonXFill,
		colour: '#e06c6c',
		only_one: true
	},
	'action.mellow.member.roles.assign': {
		icon: PeopleFill,
		colour: 'var(--button-background)',
		only_one: false
	},
	'action.mellow.message.reply': {
		icon: ReplyFill,
		colour: '#8e8e93',
		only_one: true
	},
	'action.mellow.message.reaction.create': {
		icon: PeopleFill,
		colour: '#007aff',
		only_one: false
	},
	'no_op.comment': {
		icon: JustifyLeft,
		colour: 'none',
		only_one: false
	},
	'no_op.nothing': {
		icon: SquareDotted,
		colour: 'none',
		only_one: false
	},
	'special.root': {
		icon: SquareDotted,
		colour: 'none',
		only_one: true
	},
	'statement.if': {
		icon: SignpostSplitFill,
		colour: '#8e8e93',
		only_one: false
	}
} as const;