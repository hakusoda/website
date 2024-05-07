<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import MellowProfileAction from '$lib/ui/components/MellowProfileAction.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	export let data;

	let item_filter = '';
	let items_element: HTMLDivElement;

	const highlighted = $page.url.searchParams.get('highlight');
	const item_elements: HTMLAnchorElement[] = [];
	onMount(() => {
		if (highlighted)
			items_element.scrollTo({
				top: item_elements[data.items.findIndex(item => item.id === highlighted)].offsetTop - items_element.clientHeight / 2,
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
		<TextInput bind:value={item_filter} placeholder={$t('action.search')}/>
		<Button href={`/mellow/server/${$page.params.id}/syncing/actions/create`}>
			<Plus/>{$t('mellow.server.settings.syncing.actions.create')}
		</Button>
	</div>
	<div class="items" bind:this={items_element}>
		{#each data.items.filter(item => item.display_name.toLowerCase().includes(item_filter.toLowerCase())) as item, index}
			<MellowProfileAction
				{...item}
				{index}
				items={item_elements}
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