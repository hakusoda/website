<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import type { Document } from '$lib/shared/types/visual_scripting';

	import Trash from 'virtual:icons/bi/trash';
	import Check from 'virtual:icons/bi/check-lg';
	import Sunrise from 'virtual:icons/bi/sunrise';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import DocumentIcon from '$lib/ui/icons/Document.svelte';
	import ClipboardPlusFill from 'virtual:icons/bi/clipboard-plus-fill';
	export let id: string;
	export let name: string;
	export let active: boolean;
	export let document: Document;
	export let created_at: string;

	let trigger: () => void;
</script>

<a class="mellow_server_command" href={`/mellow/server/${$page.params.id}/commands/${id}`}>
	<div class="info">
		<h1>/{name}</h1>
		<div class="details">
			<!--
			{#if last_edit}
				<p>
					<PencilFill/>
					<a href={`/user/${last_edit.author.username}`}>
						{last_edit.author.name ?? `@${last_edit.author.username}`}
					</a>
					{$t('time_ago', [last_edit.created_at])}
				</p>
			{/if}-->
			<p>
				{#if active}
					<Check/>
					Active
				{/if}
			</p>
			<p>
				<DocumentIcon/>
				{document.name}
			</p>
			<p>
				<Sunrise/>
				{$t('time_ago', [created_at])}
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
	<button type="button">
		<Trash/>{$t('action.delete')}
	</button>
</ContextMenu.Root>

<style lang="scss">
	.mellow_server_command {
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
		&:not(:disabled):hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
</style>