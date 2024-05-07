<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import { SYNC_ACTION_ICONS } from '$lib/client/model/mellow/syncing';
	import { delete_mellow_sync_action } from '$lib/client/api';
	import type { Criteria, SyncActionKind, InternalSyncAction } from '$lib/shared/types/mellow/syncing';

	import Trash from 'virtual:icons/bi/trash';
	import Sunrise from 'virtual:icons/bi/sunrise';
	import GridFill from 'virtual:icons/bi/grid-fill';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import UIChecksGrid from 'virtual:icons/bi/ui-checks-grid';
	import ClipboardPlusFill from 'virtual:icons/bi/clipboard-plus-fill';
	export let id: string;
	export let kind: SyncActionKind;
	export let creator: InternalSyncAction['creator'] = null;
	export let criteria: Criteria;
	export let created_at: string | null = null;
	export let updated_at: string | null = null;
	export let updated_by: InternalSyncAction['updated_by'] = null;
	export let display_name: string;

	export let index: number;
	export let items: HTMLAnchorElement[];
	export let remove: () => void;
	export let server_id: string;
	export let highlighted: boolean;

	let trigger: () => void;
	let deleting = false;
	const deleteAction = async () => {
		deleting = true;

		const { success } = await delete_mellow_sync_action(server_id, id);
		if (success)
			remove();

		deleting = false;
	};
</script>

<a class="mellow-profile-action" href={`/mellow/server/${$page.params.id}/syncing/actions/${id}`} class:highlighted bind:this={items[index]}>
	<div class="info">
		<h1>{display_name}</h1>
		<div class="details">
			{#if created_at}
				<p>
					<Sunrise/>
					{$t('time_ago', [created_at])}
					{#if creator}
						{$t('label.by')}
						<a href={`/user/${creator.username}`}>
							{creator.name ?? `@${creator.username}`}
						</a>
					{/if}
				</p>
			{/if}
			{#if updated_at !== created_at}
				<p>
					<PencilFill/>
					{#if updated_by}
						<a href={`/user/${updated_by.username}`}>
							{updated_by.name ?? `@${updated_by.username}`}
						</a>
					{/if}
					{$t('time_ago', [updated_at])}
				</p>
			{/if}
			<p>
				<svelte:component this={SYNC_ACTION_ICONS[kind]}/>
				{$t(`mellow_sync_action.kind.${kind}`)}
			</p>
			<p>
				{#if criteria.quantifier.kind === 'at_least'}
					<UIChecksGrid/>
				{:else}
					<GridFill/>
				{/if}
				{$t('mellow_sync_action.criteria_items', [criteria.items.length])}
			</p>
		</div>
	</div>
	<button type="button" class="options" on:click|preventDefault={trigger}>
		<ThreeDots/>
	</button>
</a>
<ContextMenu.Root bind:trigger>
	<p>{display_name}</p>
	<a href={`/mellow/server/${$page.params.id}/syncing/actions/create?clone_from_id=${id}`}>
		<ClipboardPlusFill/>{$t('action.clone')}
	</a>
	<button type="button" on:click={deleteAction} disabled={deleting}>
		<Trash/>{$t('action.delete')}
	</button>
</ContextMenu.Root>

<style lang="scss">
	.mellow-profile-action {
		width: -moz-available;
		color: var(--color-primary);
		width: -webkit-fill-available;
		border: none;
		cursor: pointer;
		display: flex;
		padding: 0 28px;
		font-size: 1em;
		min-height: 80px;
		text-align: start;
		transition: opacity .5s, box-shadow .5s;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-primary);
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 32px;
		text-decoration: none;
		.info {
			margin: 0 auto 0 0;
			h1 {
				margin: 0 0 6px;
				font-size: .9em;
				font-weight: 500;
			}
			.details {
				gap: 8px;
				margin: 8px 0 0;
				display: flex;
				p {
					gap: 6px;
					color: var(--color-secondary);
					margin: 0;
					height: 24px;
					display: flex;
					padding: 0 10px;
					font-size: .75em;
					box-shadow: 0 0 0 1px var(--border-secondary);
					align-items: center;
					border-radius: 16px;
				}
			}
		}
		.options {
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 8px;
			display: flex;
			background: none;
			transition: background .5s;
			border-radius: 50%;
			&:hover {
				background: #ffffff1a;
			}
		}
		&.highlighted {
			animation: 1s infinite alternate basic-focus;
		}
		&:not(:disabled):hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
</style>