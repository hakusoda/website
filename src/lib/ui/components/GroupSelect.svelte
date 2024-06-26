<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { browser } from '$app/environment';
	import type { GroupSelectItem } from '$lib/shared/types';

	import Avatar from './Avatar.svelte';
	import Loader from './Loader.svelte';

	import Check from 'virtual:icons/bi/check-lg';
	import Search from 'virtual:icons/bi/search';
	import ArrowLeft from 'virtual:icons/bi/arrow-left';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	export let value: string | null = null;
	export let source: 'self' | 'steam' | 'roblox';
	export let onChange: ((newValue: string) => void) | null = null;

	$: storageName = `recent-${source === 'roblox' ? 'bind' : source}-groups`;
	$: cached = (browser ? JSON.parse(localStorage.getItem(storageName) || '[]') || [] : []) as GroupSelectItem[];

	let state = 0;
	let query = '';
	let trigger: () => void;
	let results: GroupSelectItem[] = [];
	let searching = false;

	$: if (query) {
		const body = query;
		searching = true;
		setTimeout(async () => {
			if (query === body) {
				results = await fetch(`/api/${source === 'self' ? 'team' : 'roblox/group'}-lookup?query=${encodeURIComponent(body)}`)
					.then(response => response.json());
				searching = false;
			}
		}, 1000);
	} else
		results = [];

	$: cachedValue = cached.find(group => group.id === value);
</script>

<div class="group-select-container" style="display: contents">
	<button class="group-select" on:click={trigger} class:select={!value}>
		{#if value}
			<Avatar id={value} src={cachedValue?.avatar_url ?? cachedValue?.icon} size="xxxs"/>
			{cachedValue?.name ?? value}
		{:else}
			{$t(source === 'self' ? 'group_select.team' : 'group_select')}
		{/if}
		<ChevronDown/>
	</button>
	<ContextMenu.Root bind:trigger>
		{#if state || !cached.length}
			<input type="text" class="search" bind:value={query} placeholder={$t('group_select.search')}/>
			{#if searching}
				<Loader/>
			{/if}
			{#if results.length}
				<p>{$t('group_select.results', [results.length])}</p>
			{/if}
			{#each results as item}
				<button type="button" on:click={() => {
					state = 0, query = '';
					value = item.id.toString();
					onChange?.(value);
					if (!cached.some(group => group.id === item.id))
						localStorage.setItem(storageName, JSON.stringify(cached = [...cached, item]));
				}}>
					<Avatar src={item.avatar_url ?? item.icon} size="xxxs"/>
					{item.name}
				</button>
			{/each}
			{#if cached.length}
				<br/>
				<button type="button" on:click|stopPropagation={() => (state--, query = '')}>
					<ArrowLeft/>{$t('group_select.back')}
				</button>
			{/if}
		{:else}
			<p>{$t('group_select.recent')}</p>
			{#each cached as item}
				<button type="button" on:click={() => (value = item.id.toString(), onChange?.(value))}>
					<Avatar src={item.avatar_url ?? item.icon} size="xxxs"/>
					{item.name}
					{#if item.id === value}
						<Check/>
					{/if}
				</button>
			{/each}
			<br/>
			<button type="button" on:click|stopPropagation={() => state++}>
				<Search/>
				{$t('group_select.search')}
			</button>
		{/if}
	</ContextMenu.Root>
</div>

<style lang="scss">
	.group-select {
		gap: 16px;
		width: fit-content;
		color: var(--color-primary);
		height: 40px;
		border: none;
		cursor: pointer;
		padding: 0 24px;
		display: inline-flex;
		overflow: hidden;
		font-size: 14px;
		min-width: 192px;
		transition: box-shadow 0.5s;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-primary);
		font-weight: 500;
		align-items: center;
		white-space: nowrap;
		font-family: var(--font-primary);
		border-radius: 20px;
		justify-content: space-between;
		&:hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
		:global(svg) {
			margin-left: auto;
		}
		&.select {
			color: var(--color-secondary);
		}
	}
	:global(.group-select-container .text-input) {
		&:not(:last-child) {
			margin-bottom: 8px;
		}
	}
	:global(.group-select-container .content) {
		overflow: auto;
		max-height: 192px;
	}
	:global(.group-select-container .content .icon-check) {
		margin-left: auto;
	}
</style>