<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { RobloxGroupRole } from '$lib/types';
	import { MellowLinkImportType } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import MellowLinkEditor from '$lib/components/MellowLinkEditor.svelte';
	import MellowProfileAction from '$lib/components/MellowProfileAction.svelte';

	import Plus from '$lib/icons/Plus.svelte';
	export let data: PageData;

	let state = 0;
	let target: PageData['binds'][number] | null = null;
	let linksContainer: HTMLDivElement;

	let importType: MellowLinkImportType | null = null;
	let importTarget: string | null = null;
	let importTrigger: () => void;

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	let itemFilter = '';

	$: highlighted = $page.url.searchParams.get('highlight');

	const linkItems: HTMLButtonElement[] = [];
	onMount(() => {
		if (highlighted)
			linksContainer.scrollTo({
				top: linkItems[data.binds.findIndex(item => item.id === highlighted)].offsetTop - linksContainer.clientHeight / 2,
				behavior: 'smooth'
			});
	});
</script>

<div class="main">
	{#if state}
		<MellowLinkEditor
			onSave={() => linksContainer.scrollTo({ top: linksContainer.scrollHeight, behavior: 'smooth' })}
			onCancel={() => state = 0}
			serverId={$page.params.id}
			bind:data
			bind:target
		/>
	{:else}
		<h1>{$t('mellow.server.settings.syncing.actions.header')}</h1>
		<h2>{$t('mellow.server.settings.syncing.actions.summary')}</h2>
		<div class="items" bind:this={linksContainer}>
			{#each data.binds.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item, index}
				<MellowProfileAction
					{...item}
					{index}
					items={linkItems}
					remove={() => data.binds = data.binds.filter(i => i !== item)}
					server_id={$page.params.id}
					highlighted={highlighted === item.id}
					on:click={() => (target = item, state++)}
				/>
			{/each}
		</div>
		<div class="fade"/>
		<div class="buttons">
			<Button on:click={() => state++}>
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
		</div>
	{/if}
</div>

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
			width: 100%;
			height: 100%;
			display: flex;
			padding: 16px 0;
			overflow: auto;
			flex-direction: column;
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