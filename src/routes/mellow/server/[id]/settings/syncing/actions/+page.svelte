<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { mellowLinkViewMode } from '$lib/settings';
	import type { RobloxGroupRole } from '$lib/types';
	import { MAPPED_MELLOW_SYNC_ACTION_ICONS } from '$lib/constants';
	import { deleteMellowServerProfileSyncAction } from '$lib/api';
	import { MellowLinkImportType, MellowLinkListViewMode } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import MellowLinkEditor from '$lib/components/MellowLinkEditor.svelte';

	import Plus from '$lib/icons/Plus.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import GridFill from '$lib/icons/GridFill.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	import UiChecksGrid from '$lib/icons/UIChecksGrid.svelte';
	export let data: PageData;

	let target: PageData['binds'][number] | null = null;
	let trigger: () => void;
	let linksContainer: HTMLDivElement;

	let importType: MellowLinkImportType | null = null;
	let importTarget: string | null = null;
	let importTrigger: () => void;

	const deleteLink = async (id: string) => {
		const response = await deleteMellowServerProfileSyncAction($page.params.id, id);
		if (response.success)
			data.binds = data.binds.filter(bind => bind.id !== id);
		else
			alert($t(`request_error.${response.error as 0}`));
	};

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	let itemFilter = '';

	$: compact = $mellowLinkViewMode === MellowLinkListViewMode.Compact;
	$: highlighted = $page.url.searchParams.get('highlight');

	const linkItems: HTMLDivElement[] = [];
	onMount(() => {
		if (highlighted)
			linksContainer.scrollTo({
				top: linkItems[data.binds.findIndex(item => item.id === highlighted)].offsetTop - linksContainer.clientHeight / 2,
				behavior: 'smooth'
			});
	});
</script>

<div class="main">
	<h1>{$t('mellow.server.settings.syncing.actions.header')}</h1>
	<h2>{$t('mellow.server.settings.syncing.actions.summary')}</h2>
	<div class="items" bind:this={linksContainer}>
		{#each data.binds.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item, index}
			<div class="item" class:compact class:highlighted={highlighted === item.id} bind:this={linkItems[index]}>
				<div class="info">
					<h1>{item.name}</h1>
					<div class="details">
						<p>
							<Sunrise/>
							{$t('time_ago', [item.created_at])}
							{#if item.creator}
								{$t('label.by')}
								<a href={`/user/${item.creator.username}`}>
									{item.creator.name ?? `@${item.creator.username}`}
								</a>
							{/if}
						</p>
						{#if item.last_edit}
							<p>
								<PencilFill/>
								<a href={`/user/${item.last_edit.author.username}`}>
									{item.last_edit.author.name ?? `@${item.last_edit.author.username}`}
								</a>
								{$t('time_ago', [item.last_edit.created_at])}
							</p>
						{/if}
						<p>
							<svelte:component this={MAPPED_MELLOW_SYNC_ACTION_ICONS[item.type]}/>
							{$t(`mellow_bind.type.${item.type}.full`)}
						</p>
						<p>
							{#if item.requirements_type}
								<UiChecksGrid/>
							{:else}
								<GridFill/>
							{/if}
							{$t('mellow_bind.requirements', [item.requirements.length])}
						</p>
					</div>
				</div>
				<div class="buttons">
					<Button on:click={() => target = item}>
						<PencilFill/>{$t('action.edit')}
					</Button>
					<Button colour="secondary" circle on:click={() => deleteLink(item.id)}>
						<Trash/>
					</Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="fade"/>
	<div class="buttons">
		<Button on:click={trigger}>
			<Plus/>{$t('mellow.server.settings.syncing.actions.create')}
		</Button>
		<DropdownMenu.Root bind:trigger={importTrigger}>
			<Button slot="trigger" colour="secondary" on:click={importTrigger} title="coming soon!!!" disabled>
				<Plus/>{$t('mellow.server.settings.syncing.actions.import')}
			</Button>
			<p>{$t('mellow.server.settings.syncing.actions.import.category')}</p>
			{#each Object.values(MellowLinkImportType) as type}
				{#if typeof type === 'number'}
					<button type="button" on:click={() => importType = +type}>
						{$t(`mellow.server.settings.syncing.actions.import.type.${type}`)}
					</button>
				{/if}
			{/each}
		</DropdownMenu.Root>
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<!--<Select.Root bind:value={$mellowLinkViewMode}>
			{#each Object.values(MellowLinkListViewMode) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_bind.view_mode.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>-->
	</div>
</div>

<MellowLinkEditor
	onSave={() => linksContainer.scrollTo({ top: linksContainer.scrollHeight, behavior: 'smooth' })}
	serverId={$page.params.id}
	bind:data
	bind:target
	bind:trigger
/>

{#if importType === MellowLinkImportType.RobloxGroupRolesToDiscordRoles}
	<Modal autoOpen>
		<p class="modal-label">{$t('group_select')}</p>
		<GroupSelect source="roblox" bind:value={importTarget}/>
	</Modal>
{/if}

<style lang="scss">
	.main {
		width: 100%;
		margin: 0px 64px 32px;
		display: flex;
		position: relative;
		flex-direction: column;
		h1 {
			margin: 24px 0 16px;
		}
		h2 {
			color: var(--color-secondary);
			margin: 0 0 16px;
			font-size: .9em;
			font-weight: 400;
			line-height: normal;
			white-space: pre-line;
		}
		.items {
			gap: 16px;
			height: 100%;
			display: flex;
			padding: 16px 0;
			overflow: auto;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 16px 16px 20px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 24px;
				.info {
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
				.buttons {
					gap: 16px;
					display: flex;
					margin-left: auto;
				}
				&.highlighted {
					animation: 1s infinite alternate basic-focus;
				}
			}
		}
		.fade {
			left: 0;
			width: 100%;
			bottom: 48px;
			height: 32px;
			position: absolute;
			background: linear-gradient(to bottom, transparent, var(--background-primary));
		}
		& > .buttons {
			gap: 16px;
			margin: 16px 0 0;
			display: flex;
			:global(input) {
				margin-left: auto;
			}
		}
	}
</style>