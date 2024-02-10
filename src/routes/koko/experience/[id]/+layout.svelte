<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';

	import AppLayout from '$lib/layouts/AppLayout.svelte';

	import GearFill from 'virtual:icons/bi/gear-fill';
	import BrandIcon from '$lib/icons/BrandIcon.svelte';
	import ChevronUp from 'virtual:icons/bi/chevron-up';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	import Diagram3Fill from 'virtual:icons/bi/diagram-3-fill';
	import HouseDoorFill from 'virtual:icons/bi/house-door-fill';
	export let data;

	$: base = `/koko/experience/${$page.params.id}`;

	let trigger: () => void;
</script>

<AppLayout
	navigation={[
		[base, HouseDoorFill, 'navigation.koko.experience', true],
		[`${base}/servers`, PeopleFill, 'navigation.koko.experience.servers'],
		[`${base}/server_actions`, Diagram3Fill, 'koko.experience.server_actions'],
		[`${base}/settings`, GearFill, 'navigation.mellow.server.settings']
	]}
	disableDefaultBrand
	disableDefaultTopNav
>
	<img src="/img/placeholder.png" alt="" width="32" height="32" slot="header-top"/>
	<button class="server" type="button" slot="header-top-nav" on:click={trigger}>
		{data.display_name}
		<div class="arrows">
			<ChevronUp font-size={12}/>
			<ChevronDown font-size={12}/>
		</div>
	</button>
	<slot/>
</AppLayout>

<ContextMenu.Root bind:trigger>
	<p>{$t('settings.mellow.servers')}</p>
	{#each data.experiences as item}
		<a href={`/koko/experience/${item.id}${$page.url.pathname.match(/experience\/\d+(.*)/)?.[1] ?? ''}`}>
			{item.display_name}
		</a>
	{/each}
	<div class="separator"/>
	<a href="/settings/mellow">
		<BrandIcon/>{$t('action.return_from_mellow')}
	</a>
</ContextMenu.Root>

<style lang="scss">
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