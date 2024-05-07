<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';
	import type { GroupRole } from '@hakumi/roblox-open-cloud';

	import { t } from '$lib/ui/localisation';
	import type { AutoImportItem } from '$lib/shared/types/mellow/syncing';

	import X from 'virtual:icons/bi/x-lg';
	import Plus from 'virtual:icons/bi/plus-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import Discord from '$lib/ui/icons/Discord.svelte';
	import ArrowRight from 'virtual:icons/bi/arrow-right';
	import RobloxIcon from '$lib/ui/icons/RobloxIcon.svelte';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	export let item: AutoImportItem;
	export let active = true;
	export let disabled = false;
	export let roblox_role: GroupRole | null = null;
	export let discord_roles: { id: string, name: string, icon: string | null }[];

	$: role = item.discord_role;

	let filter = '';
	let trigger: () => void;
</script>

<div class="auto_import_item" class:disabled>
	<button type="button" class="toggle" class:active on:click={() => active = !active} {disabled}>
		{#if active}
			<Check font-size={14}/>
		{:else}
			<X font-size={12}/>
		{/if}
	</button>
	<p class="role">
		<RobloxIcon/>
		{roblox_role?.displayName}
	</p>
	{#if active}
		<p class="arrow">
			<ArrowRight/>
		</p>
		<button type="button" class="discord_role" class:create={role.kind === 'create_new'} on:click={trigger} {disabled}>
			{#if role.kind === 'create_new'}
				<Plus/>{role.name}<ChevronDown/>
			{:else}
				<Discord/>{discord_roles.find(item => item.id === role.role_id)?.name}<ChevronDown/>
			{/if}
		</button>
	{:else}
		<p class="inactive">
			{$t('mellow_sync_action_editor.auto_import.item.inactive')}
		</p>
	{/if}
</div>

<div class="auto_import_item_context_menu" style="display: contents;">
	<ContextMenu.Root bind:trigger>
		<input type="text" class="search" bind:value={filter} placeholder="Search roles..."/>
		{#each discord_roles.filter(role => role.name.toLowerCase().includes(filter.toLowerCase())) as role}
			<button type="button" on:click={() => (item.discord_role = { kind: 'use_existing', role_id: role.id }, filter = '')}>
				{#if role.icon}
					<img src={`https://cdn.discordapp.com/role-icons/${role.id}/${role.icon}.png?size=32`} alt="icon" width="16" height="16"/>
				{/if}
				{role.name}
			</button>
		{/each}
		{#if filter}
			<button type="button" on:click={() => (item.discord_role = { kind: 'create_new', name: filter }, filter = '')}>
				<Plus/>{$t('mellow_sync_action_editor.auto_import.item.discord_role.create', [filter])}
			</button>
		{/if}
	</ContextMenu.Root>
</div>

<style lang="scss">
	.auto_import_item {
		height: 32px;
		display: flex;
		padding: 0 12px;
		position: relative;
		transition: opacity .5s;
		align-items: center;
		white-space: nowrap;
		&.disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
		&:not(:last-child) {
			border-bottom: 1px solid var(--border-primary);
		}
		button.toggle {
			all: unset;
			width: 16px;
			height: 16px;
			cursor: pointer;
			display: flex;
			transition: background .5s, box-shadow .5s;
			box-shadow: 0 0 0 1px var(--border-secondary);
			align-items: center;
			border-radius: 4px;
			justify-content: center;
			&.active {
				background: var(--button-background);
				box-shadow: 0 0 0 1px var(--button-background);
				&:not(:disabled):hover {
					background: none;
				}
			}
			&:disabled {
				cursor: not-allowed;
			}
			&:not(:disabled):hover {
				box-shadow: 0 0 0 1px var(--button-background);
			}
		}
		.role {
			gap: 6px;
			margin: 0 32px 0 16px;
			display: flex;
			font-size: .8em;
			align-items: center;
		}
		&:has(.inactive) .role {
			opacity: 0.5;
			font-style: italic;
		}
		.arrow {
			top: 25%;
			left: 50%;
			display: flex;
			position: absolute;
			transform: translate(-50%);
		}
		.discord_role {
			all: unset;
			gap: 6px;
			color: var(--menu-color-hover);
			cursor: pointer;
			display: flex;
			font-size: .8em;
			margin-left: auto;
			align-items: center;
			padding-left: 32px;
			&.create {
				color: hsl(100, 100%, 85%);
			}
			&:disabled {
				cursor: not-allowed;
			}
		}
		.inactive {
			margin: 0 4px 0 auto;
			opacity: 0.5;
			font-size: .8em;
			font-style: italic;
		}
	}
	.auto_import_item_context_menu img {
		object-fit: contain;
	}
	:global(.auto_import_item_context_menu .context-menu.menu-content) {
		overflow: auto;
		max-height: 256px;
	}
</style>