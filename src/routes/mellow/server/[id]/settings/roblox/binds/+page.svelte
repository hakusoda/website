<script lang="ts">
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';
	import { mellowLinkViewMode } from '$lib/settings';
	import type { RobloxGroupRole } from '$lib/types';
	import { MellowLinkListViewMode } from '$lib/enums';
	import { MellowLinkImportType } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import MellowLinkEditor from '$lib/components/MellowLinkEditor.svelte';

	import Plus from '$lib/icons/Plus.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	export let data: PageData;

	let target: PageData['binds'][number] | null = null;
	let trigger: () => void;
	let linksContainer: HTMLDivElement;

	let importType: MellowLinkImportType | null = null;
	let importTarget: string | null = null;
	let importTrigger: () => void;

	const deleteBind = async (id: string) => {
		const response = await fetch('?/delete', {
			body: id,
            method: 'POST'
        });
		if (response.status === 200)
			data.binds = data.binds.filter(bind => bind.id !== id);
	};

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	let bindFilter = '';

	$: compact = $mellowLinkViewMode === MellowLinkListViewMode.Compact;
</script>

<div class="main">
	<div class="binds" bind:this={linksContainer}>
		{#each data.binds.filter(item => item.name.toLowerCase().includes(bindFilter)) as item}
			<div class="item" class:compact>
				<div class="name">
					<h1>{item.name}</h1>
					{#if !compact}
						<p>{$t('mellow_bind.creator')} <a href={`/user/${item.creator.username}`}>{item.creator.name ?? item.creator.username}</a> {$t('time_ago', [item.created_at])}{#if item.last_edit}{$t('mellow_bind.edited')} <a href={`/user/${item.last_edit.author.username}`}>{item.last_edit.author.name ?? item.last_edit.author.username}</a> {$t('time_ago', [item.last_edit.created_at])}{/if}</p>
					{/if}
					<p>{$t(`mellow_bind.explanation.${item.type}`, [item.target_ids])} {$t(`mellow_bind.explanation.end.${item.requirements_type}`, [item.requirements.length])}</p>
				</div>
				<div class="buttons">
					<Button on:click={() => target = item}>
						<PencilFill/>{$t('action.edit')}
					</Button>
					<Button on:click={() => deleteBind(item.id)}>
						<Trash/>
					</Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="fade"/>
	<div class="buttons">
		<Button on:click={trigger}>
			<Plus/>{$t('mellow.server.settings.roblox.binds.create')}
		</Button>
		<DropdownMenu bind:trigger={importTrigger}>
			<Button slot="trigger" on:click={importTrigger} title="coming soon!!!" disabled>
				<Plus/>{$t('mellow.server.settings.roblox.binds.import')}
			</Button>
			<p>{$t('mellow.server.settings.roblox.binds.import.category')}</p>
			{#each Object.values(MellowLinkImportType) as type}
				{#if typeof type === 'number'}
					<button type="button" on:click={() => importType = +type}>
						{$t(`mellow.server.settings.roblox.binds.import.type.${type}`)}
					</button>
				{/if}
			{/each}
		</DropdownMenu>
		<TextInput bind:value={bindFilter} placeholder={$t('action.search')}/>
		<Select.Root bind:value={$mellowLinkViewMode}>
			{#each Object.values(MellowLinkListViewMode) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_bind.view_mode.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>
	</div>
</div>

<MellowLinkEditor
	onSave={() => linksContainer.scrollTo({ top: linksContainer.scrollHeight, behavior: 'smooth' })}
	bind:data
	bind:target
	bind:trigger
/>

{#if importType === MellowLinkImportType.RobloxGroupRolesToDiscordRoles}
	<Modal autoOpen>
		<p class="modal-label">{$t('group_select')}</p>
		<GroupSelect bind:value={importTarget}/>
	</Modal>
{/if}

<style lang="scss">
	.main {
		width: 100%;
		margin: 0px 64px 32px 64px;
		display: flex;
		position: relative;
		flex-direction: column;
		.binds {
			gap: 16px;
			height: 100%;
			display: flex;
			padding: 32px 0;
			overflow: auto;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 16px 16px 24px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.name {
					h1 {
						margin: 0 0 6px;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .75em;
					}
				}
				.buttons {
					gap: 16px;
					display: flex;
					margin-left: auto;
				}
				&.compact {
					padding: 8px 16px;
					border-radius: 8px;
					.name {
						font-size: .9em;
						h1 {
							margin-bottom: 4px;
						}
					}
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
			display: flex;
			margin-top: 16px;
			:global(input) {
				margin-left: auto;
			}
		}
	}
</style>