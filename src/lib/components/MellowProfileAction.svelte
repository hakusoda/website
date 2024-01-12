<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { MAPPED_MELLOW_SYNC_ACTION_ICONS } from '$lib/constants';
	import { deleteMellowServerProfileSyncAction } from '$lib/api';
	import type { MellowProfileSyncActionType, MellowProfileSyncActionRequirementsType } from '$lib/enums';

	import Trash from 'virtual:icons/bi/trash';
	import Sunrise from 'virtual:icons/bi/sunrise';
	import GridFill from 'virtual:icons/bi/grid-fill';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import UIChecksGrid from 'virtual:icons/bi/ui-checks-grid';
	import ClipboardPlusFill from 'virtual:icons/bi/clipboard-plus-fill';
	export let id: string;
	export let name: string;
	export let type: MellowProfileSyncActionType;
	export let index: number;
	export let items: HTMLAnchorElement[];
	export let remove: () => void;
	export let creator: { name: string | null, username: string } | null = null;
	export let server_id: string;
	export let last_edit: { author: { name: string | null, username: string }, created_at: string } | null = null;
	export let created_at: string;
	export let highlighted: boolean;
	export let requirements: unknown[];
	export let requirements_type: MellowProfileSyncActionRequirementsType;

	let trigger: () => void;
	let deleting = false;
	const deleteAction = async () => {
		deleting = true;

		const { success } = await deleteMellowServerProfileSyncAction(server_id, id);
		if (success)
			remove();

		deleting = false;
	};
</script>

<a class="mellow-profile-action" href={`/mellow/server/${$page.params.id}/syncing/actions/${id}`} class:highlighted bind:this={items[index]}>
	<div class="info">
		<h1>{name}</h1>
		<div class="details">
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
			{#if last_edit}
				<p>
					<PencilFill/>
					<a href={`/user/${last_edit.author.username}`}>
						{last_edit.author.name ?? `@${last_edit.author.username}`}
					</a>
					{$t('time_ago', [last_edit.created_at])}
				</p>
			{/if}
			<p>
				<svelte:component this={MAPPED_MELLOW_SYNC_ACTION_ICONS[type]}/>
				{$t(`mellow_sync_action.type.${type}.full`)}
			</p>
			<p>
				{#if requirements_type}
					<UIChecksGrid/>
				{:else}
					<GridFill/>
				{/if}
				{$t('mellow_sync_action.requirements', [requirements.length])}
			</p>
		</div>
	</div>
	<button type="button" class="options" on:click|preventDefault={trigger}>
		<ThreeDots/>
	</button>
</a>
<ContextMenu.Root bind:trigger>
	<p>{name}</p>
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