<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import ServerCommand from '$lib/ui/components/mellow/ServerCommand.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	export let data;

	let itemFilter = '';
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('mellow.server.settings.commands')}</h1>
		<p>{$t('mellow.server.settings.commands.summary')}</p>
	</div>
</div>
<div class="geist">
	<div class="buttons">
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<Button href={`/mellow/server/${$page.params.id}/commands/create`}>
			<Plus/>{$t('mellow.server.settings.commands.create')}
		</Button>
	</div>
	<div class="items">
		{#each data.commands.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item, index}
			<ServerCommand {...item}/>
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