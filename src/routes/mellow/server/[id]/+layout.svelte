<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	import AppLayout from '$lib/ui/layouts/AppLayout.svelte';

	import Link from 'virtual:icons/bi/link-45deg';
	import GearFill from 'virtual:icons/bi/gear-fill';
	import BrandIcon from '$lib/ui/icons/BrandIcon.svelte';
	import ChevronUp from 'virtual:icons/bi/chevron-up';
	import MellowIcon from '$lib/ui/icons/MellowIcon.svelte';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	import HouseDoorFill from 'virtual:icons/bi/house-door-fill';
	export let data;

	$: base = `/mellow/server/${$page.params.id}`;

	let trigger: () => void;
</script>

<AppLayout
	navigation={[
		[base, HouseDoorFill, 'navigation.mellow.server', true],
		[`${base}/syncing/actions`, Link, 'navigation.mellow.server.actions'],
		[`${base}/settings`, GearFill, 'navigation.mellow.server.settings']
	]}
	disableDefaultBrand
	disableDefaultTopNav
>
	<MellowIcon size={32} slot="header-top"/>
	<button class="server" type="button" slot="header-top-nav" on:click={trigger}>
		<Avatar id={$page.params.id} src={data.avatar_url} size="xxs"/>
		{data.name}
		<div class="arrows">
			<ChevronUp font-size={12}/>
			<ChevronDown font-size={12}/>
		</div>
	</button>
	<slot/>
</AppLayout>

<ContextMenu.Root bind:trigger>
	<p>{$t('settings.mellow.servers')}</p>
	{#each data.servers as item}
		<a href={`/mellow/server/${item.id}${$page.url.pathname.match(/server\/\d+(.*)/)?.[1] ?? ''}`}>
			<Avatar id={item.id} src={item.avatar_url} size="xxs"/>
			{item.name}
		</a>
	{/each}
	<div class="separator"/>
	<a href="/settings/mellow">
		<BrandIcon/>{$t('action.return_from_mellow')}
	</a>
</ContextMenu.Root>

<style lang="scss">
	:global(.icon.icon-mellow) {
		border-radius: 4px;
	}
	.server {
		gap: 12px;
		color: inherit;
		margin: 0;
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		position: relative;
		font-size: .9em;
		background: none;
		font-weight: 500;
		align-items: center;
		font-family: inherit;
		border-radius: 8px;
		.arrows {
			display: flex;
			flex-direction: column;
		}
		&:before {
			top: -8px;
			left: -8px;
			width: calc(100% + 16px);
			height: calc(100% + 16px);
			content: '';
			position: absolute;
			transition: background .25s;
			border-radius: 8px;
		}
		&:hover:before {
			background: #ffffff0d;
		}
	}
</style>