<script lang="ts">
	import { onMount } from 'svelte';
	import type { GroupRole } from '@hakumi/roblox-api';
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';

	import MellowProfileAction from '$lib/components/MellowProfileAction.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	export let data;

	let linksContainer: HTMLDivElement;

	let groupRoles: Record<string, GroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	let itemFilter = '';

	$: highlighted = $page.url.searchParams.get('highlight');

	const linkItems: HTMLAnchorElement[] = [];
	onMount(() => {
		if (highlighted)
			linksContainer.scrollTo({
				top: linkItems[data.items.findIndex(item => item.id === highlighted)].offsetTop - linksContainer.clientHeight / 2,
				behavior: 'smooth'
			});
	});
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('mellow.server.settings.syncing.actions.header')}</h1>
		<p>{$t('mellow.server.settings.syncing.actions.summary')}</p>
	</div>
</div>
<div class="geist">
	<div class="buttons">
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<Button href={`/mellow/server/${$page.params.id}/syncing/actions/create`}>
			<Plus/>{$t('mellow.server.settings.syncing.actions.create')}
		</Button>
	</div>
	<div class="items" bind:this={linksContainer}>
		{#each data.items.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item, index}
			<MellowProfileAction
				{...item}
				{index}
				items={linkItems}
				remove={() => data.items = data.items.filter(i => i !== item)}
				server_id={$page.params.id}
				highlighted={highlighted === item.id}
			/>
		{/each}
	</div>
</div>

<style lang="scss">
	.items {
		gap: 16px;
		width: 100%;
		height: 100%;
		display: flex;
		padding: 16px 0;
		overflow: auto;
		flex-direction: column;
	}
	.buttons {
		gap: 16px;
		margin: 16px 0 0;
		display: flex;
		justify-content: space-between;
	}
</style>