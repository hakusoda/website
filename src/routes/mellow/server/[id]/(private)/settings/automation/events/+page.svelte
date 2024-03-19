<!--hey!

	this is VERY unfinished!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

-->

<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { clone_json } from '$lib/shared/util';
	import { update_mellow_server_event } from '$lib/client/api';
	import { create_event_response_item } from '$lib/client/util';
	import type { EventResponseItem, EventResponseVariable } from '$lib/shared/types';
	import { EVENT_RESPONSE_TREES, EVENT_RESPONSE_ITEM_KINDS } from '$lib/shared/constants';

	import X from 'virtual:icons/bi/x-lg';
	import Plus from 'virtual:icons/bi/plus-lg';
	import Trash3 from 'virtual:icons/bi/trash3';
	import FloppyFill from 'virtual:icons/bi/floppy-fill';
	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import GripVertical from 'virtual:icons/bi/grip-vertical';
	import PersonFillAdd from 'virtual:icons/bi/person-fill-add';
	export let data;

	let trigger: () => void;
	let saving = false;
	let editing: EventResponseItem[] | undefined;
	let dragging: number | undefined;
	let drag_index = 0;
	let drag_offset: number | undefined;
	let dragging_element: HTMLElement | undefined;

	let items_element: HTMLDivElement;

	let select_variables: EventResponseVariable[] = [];
	let select_variable_trigger: () => void;
	function handle_mouse_move(event: MouseEvent): void {
		if (drag_offset === undefined || !dragging_element)
			return window.removeEventListener('mousemove', handle_mouse_move);

		const items_rect = items_element.getBoundingClientRect();
		const position = event.clientY - items_rect.y - drag_offset;
		drag_index = Math.round((position - 28) / 56);

		dragging_element.style.top = `${position}px`;
	}

	const item_mousedown = (event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }, index: number) => {
		if (saving || editing!.length === 1)
			return;
		
		const button = event.currentTarget.parentElement!;
		const button_rect = button.getBoundingClientRect();;
		dragging = index;
		drag_offset = event.clientY - button_rect.y + 1;
		dragging_element = button;

		handle_mouse_move(event);
		window.addEventListener('mousemove', handle_mouse_move);
	};

	const string_var = (): EventResponseVariable => ({ kind: 'string' });
	const compute_variables_to_point = (items: EventResponseItem[], index: number): EventResponseVariable[] => {
		const variables: EventResponseVariable[] = [{
			name: 'member',
			kind: 'object',
			definition: {
				username: string_var()
			}
		}];

		return variables;
	};

	const save = async () => {
		saving = true;
		const response = await update_mellow_server_event($page.params.id, 'member_join', editing!);
		if (response.success)
			editing = undefined;

		saving = false
	};
</script>

<div class="header">
	<h2>{$t('mellow.server.settings.automation.events')}</h2>
	<p>{$t('mellow.server.settings.automation.events.summary')}</p>
</div>

<div class="event-block" class:editing={!!editing}>
	<div class="header">
		<PersonFillAdd font-size={24}/>{$t('event.mellow.discord.member_join')}
		{#if editing}
			<button type="button" class="save" on:click={save} disabled={saving}>
				<FloppyFill font-size={14}/>{$t('action.save')}
			</button>
			<button type="button" on:click={() => editing = undefined} disabled={saving}>
				<X font-size={14}/>{$t('action.cancel')}
			</button>
		{:else}
			<button type="button" on:click={() => editing = clone_json(data.member_join_event_response_tree)}>
				<PencilFill font-size={14}/>{$t('action.edit')}
			</button>
		{/if}
	</div>
	<div class="items" bind:this={items_element}>
		{#each editing ?? data.member_join_event_response_tree as item, index}
			{#if index === 0 && dragging !== undefined && drag_index < index}
				<div/>
			{/if}
			<div class:dragging={index === dragging}>
				{#if editing}
					<button type="button" class="drag-region" on:mousedown={event => item_mousedown(event, index)} on:mouseup={() => (dragging = drag_offset = dragging_element = undefined)}>
						<GripVertical/>
					</button>
				{/if}
				<svelte:component this={EVENT_RESPONSE_ITEM_KINDS[item.kind].icon} font-size={editing ? 20 : undefined}/>
				{$t(`event_response_item.kind.${item.kind}`)}
				{#if editing}
					<button type="button" on:click={() => editing = editing?.filter(i => i !== item)} disabled={saving}>
						<Trash3/>
					</button>
				{/if}
			</div>
			{#if editing && item.kind === 'statement.if'}
				{#each item.blocks[0].items as item2}
					<div class="block">
						<svelte:component this={EVENT_RESPONSE_ITEM_KINDS[item2.kind].icon} font-size={20}/>
						{$t(`event_response_item.kind.${item2.kind}`)}
						<button type="button" on:click={() => editing = editing?.filter(i => i !== item)} disabled={saving}>
							<Trash3/>
						</button>
					</div>
				{/each}
				<div>
					<svelte:component this={EVENT_RESPONSE_ITEM_KINDS[item.kind].icon} font-size={20}/>
					End if
				</div>
			{/if}
			{#if dragging !== undefined && drag_index === index}
				<div/>
			{/if}
		{/each}
		{#if editing}
			<button type="button" on:click={trigger} disabled={saving}>
				<Plus/>{$t('action.add_item')}
			</button>
		{/if}
	</div>
</div>

<ContextMenu.Root bind:trigger>
	<p>Response Items</p>
	{#each EVENT_RESPONSE_TREES['mellow.discord.member_join'].allowed_item_kinds as kind}
		<button type="button" on:click={() => {
			if (EVENT_RESPONSE_ITEM_KINDS[kind].only_one && editing?.some(item => item.kind === kind))
				return alert('you cannot add anymore instances of this action!');

			// i love the svelte language server
			if (editing)
				editing = [...editing, create_event_response_item(kind)];
		}}>
			<svelte:component this={EVENT_RESPONSE_ITEM_KINDS[kind].icon}/>{$t(`event_response_item.kind.${kind}`)}
		</button>
	{/each}
</ContextMenu.Root>

<ContextMenu.Root bind:trigger={select_variable_trigger}>

</ContextMenu.Root>

<style lang="scss">
	.event-block {
		box-shadow: 0 0 0 1px var(--border-primary);
		border-radius: 16px;
		.header {
			gap: 16px;
			height: 56px;
			display: flex;
			padding: 0 20px;
			background: #0000001a;
			align-items: center;
			border-bottom: 1px solid var(--border-primary);
			button {
				gap: 12px;
				color: var(--color-primary);
				border: none;
				height: 32px;
				cursor: pointer;
				margin: 0 -6px 0 auto;
				display: flex;
				padding: 0 16px;
				font-size: .75em;
				background: #ffffff0a;
				transition: opacity .5s, background .5s, box-shadow .5s;
				box-shadow: inset 0 0 0 1px #ffffff1a, 0 0 4px 0 #00000060;
				font-family: var(--font-primary);
				align-items: center;
				border-radius: 8px;
				&:disabled {
					opacity: 0.5;
				}
				&:not(:disabled):hover {
					background: #ffffff0c;
					box-shadow: inset 0 0 0 1px #ffffff2a, 0 0 4px 0 #00000060;
				}
				&.save {
					background: var(--button-background);
					box-shadow: inset 0 0 0 1px #ffffff3a, 0 0 4px 0 #00000060;
					&:not(:disabled):hover {
						background: var(--button-background-hover);
						box-shadow: inset 0 0 0 1px #ffffff4a, 0 0 4px 0 #00000060;
					}
				}
			}
		}
		.items {
			display: flex;
			overflow: hidden;
			position: relative;
			flex-direction: column;
			& > div:not(:last-child) {
				border-bottom: 1px solid var(--border-primary);
			}
			div button:not(.drag-region) {
				width: 40px;
				height: 40px;
				margin: 0 8px 0 auto;
				padding: 0;
				background: none;
				transition: background .5s;
				border-radius: 8px;
				justify-content: center;
				&:hover {
					background: #ffffff1a;
				}
			}
			& > div, & > button {
				gap: 16px;
				color: var(--color-secondary);
				height: 40px;
				display: flex;
				overflow: hidden;
				font-size: .9em;
				align-items: center;
				&:not(:has(.drag-region)) {
					padding: 0 24px;
				}
				.drag-region {
					color: var(--color-secondary);
					height: 100%;
					cursor: grab;
					border: none;
					margin: 0 -16px 0 0;
					display: flex;
					padding: 0 16px;
					font-size: 1em;
					background: none;
					align-items: center;
					&:active {
						cursor: grabbing;
					}
					&:hover {
						color: var(--color-primary);
					}
				}
			}
			& > div.block {
				padding: 0 0 0 48px;
			}
			button:not(.drag-region) {
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				background: #ffffff05;
				transition: background .5s;
				border-radius: 0 0 15px 15px;
				&:hover {
					background: #ffffff0a;
				}
			}
			.dragging {
				width: 100%;
				position: absolute;
				background: var(--background-primary);
				border-top: 1px solid var(--border-primary);
			}
		}
		&.editing {
			.header button:last-child {
				margin-left: 4px;
			}
			.items div:not(.buttons) {
				height: 56px;
			}
		}
	}
</style>