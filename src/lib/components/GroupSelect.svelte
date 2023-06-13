<script lang="ts">
	import { TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import Avatar from './Avatar.svelte';
	import type { PartialRobloxGroup } from '../types';

	import Search from '../icons/Search.svelte';
	import ChevronDown from '../icons/ChevronDown.svelte';
	export let value: string | null = null;
	export let onChange: ((newValue: string) => void) | null = null;

	$: cached = (JSON.parse(localStorage.getItem('recent-bind-groups') || '[]') || []) as (PartialRobloxGroup & { icon: string })[];

	let state = 0;
	let query = '';
	let trigger: () => void;
	let results: (PartialRobloxGroup & { icon: string })[] = [];
	let searching = false;

	$: if (query) {
		const body = query;
		searching = true;
		setTimeout(async () => {
			if (query === body) {
				results = await fetch(`/api/roblox/group-lookup?query=${encodeURIComponent(body)}`)
					.then(response => response.json());
				searching = false;
			}
		}, 1000);
	} else
		results = [];

	$: cachedValue = cached.find(group => group.id.toString() === value);
</script>

<div class="group-select-container" style="display: contents">
	<DropdownMenu bind:trigger>
		<button class="group-select" slot="trigger" on:click={trigger}>
			{#if value}
				<Avatar src={cachedValue?.icon} size="xxxs"/>
				{cachedValue?.name ?? value}
			{:else}
				{$t('group_select')}
			{/if}
			<ChevronDown/>
		</button>
		{#if state || !cached.length}
			<p>{$t(searching ? 'group_select.searching' : results.length ? 'group_select.select' : query ? 'group_select.empty' : 'group_select.enter')}</p>
			<TextInput bind:value={query} placeholder={$t('group_select.search')}/>
			{#if results.length}
				<p>{$t('group_select.results', [results.length])}</p>
			{/if}
			{#each results as item}
				<button type="button" on:click={() => {
					state = 0, query = '';
					value = item.id.toString();
					onChange?.(value);
					if (!cached.some(group => group.id === item.id))
						localStorage.setItem('recent-bind-groups', JSON.stringify(cached = [...cached, item]));
				}}>
					<Avatar src={item.icon} size="xxxs"/>
					{item.name}
				</button>
			{/each}
		{:else}
			<p>{$t('group_select.recent')}</p>
			{#each cached as item}
				<button type="button" on:click={() => {
					value = item.id.toString();
					onChange?.(value);
				}}>
					<Avatar src={item.icon} size="xxxs"/>
					{item.name}
				</button>
			{/each}
			<button type="button" on:click|stopPropagation={() => state++}>
				<Search/>
				{$t('group_select.search')}
			</button>
		{/if}
	</DropdownMenu>
</div>

<style lang="scss">
	.group-select {
		gap: 8px;
		width: fit-content;
		color: var(--color-primary);
		height: 32px;
		border: none;
		padding: 0 16px;
		display: inline-flex;
		font-size: .75em;
		min-width: 192px;
		background: none;
		transition: box-shadow 0.25s;
		box-shadow: 0 0 0 1px var(--border-primary);
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 4px;
		justify-content: space-between;
		&:hover {
			box-shadow: 0 0 0 1px var(--border-secondary);
		}
		:global(svg) {
			margin-left: auto;
		}
	}
	:global(.group-select-container .text-input) {
		// there is currently a bug with voxeliface,
		// where the ROOT of menus have a font size of .75em, instead of the children.
		width: 100%;
		font-size: 1em !important;
		&:not(:last-child) {
			margin-bottom: 8px;
		}
	}
	:global(.group-select-container .content) {
		overflow: auto;
		max-height: 192px;
	}
</style>