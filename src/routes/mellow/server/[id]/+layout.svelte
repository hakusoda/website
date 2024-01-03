<script lang="ts">
	import { DropdownMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from '../../$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import Link from '$lib/icons/Link.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import BrandIcon from '$lib/icons/BrandIcon.svelte';
	import ChevronUp from '$lib/icons/ChevronUp.svelte';
	import MellowIcon from '$lib/icons/MellowIcon.svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	import HouseDoorFill from '$lib/icons/HouseDoorFill.svelte';
	import ArrowRightShort from '$lib/icons/ArrowRightShort.svelte';
	export let data: LayoutData;

	$: user = data.user!;

	let trigger: () => void;
	const paths = [{
		icon: HouseDoorFill,
		path: ''
	}, {
		icon: Link,
		path: '/syncing/actions'
	}, {
		icon: GearFill,
		path: '/settings'
	}];
</script>

<header>
	<div class="head">
		<MellowIcon size={32}/>
		<ArrowRightShort size={24} fill="#ffffff80"/>
		<p class="user">
			<Avatar id={user.id} src={user.avatar_url} size="xxs" circle/>
			{user.name || user.username}
		</p>
		<ArrowRightShort size={24} fill="#ffffff80"/>
		<DropdownMenu.Root bind:trigger>
			<button class="server" type="button" slot="trigger" on:click={trigger}>
				<Avatar id={$page.params.id} src={data.avatar_url} size="xxs"/>
				{data.name}
				<div class="arrows">
					<ChevronUp size={12}/>
					<ChevronDown size={12}/>
				</div>
			</button>
			<p>{$t('settings.mellow.servers')}</p>
			{#each data.servers as item}
				<a href={`/mellow/server/${item.id}${$page.url.pathname.match(/server\/\d+(.*)/)?.[1] ?? ''}`}>
					<Avatar id={item.id} src={item.avatar_url} size="xxs"/>
					{item.name}
				</a>
			{/each}
			<div class="separator"/>
			<a href="/settings/mellow/servers">
				<BrandIcon/>{$t('action.return_from_mellow')}
			</a>
		</DropdownMenu.Root>
	</div>
	<div class="navigation">
		{#each paths as path, index}
			<a href={`/mellow/server/${$page.params.id}${path.path}`} class:active={$page.url.pathname[path.path ? 'includes' : 'endsWith'](`${$page.params.id}${path.path}`)}>
				<svelte:component this={path.icon}/>
				{$t(`mellow.server.${index}`)}
			</a>
		{/each}
	</div>
</header>
<main>
	<slot/>
</main>

<style lang="scss">
	header {
		top: -56px;
		z-index: 1;
		padding: 16px 24px;
		position: sticky;
		background: var(--background-primary);
		border-bottom: 1px solid var(--border-primary);
		.head {
			gap: 16px;
			color: var(--color-primary);
			display: flex;
			align-items: center;
			:global(.icon.mellow-icon) {
				border-radius: 4px;
			}
			.user, .server {
				gap: 12px;
				margin: 0;
				display: flex;
				font-size: .9em;
				font-weight: 500;
				align-items: center;
				.arrows {
					display: flex;
					flex-direction: column;
				}
			}
			.server {
				color: inherit;
				border: none;
				cursor: pointer;
				padding: 0;
				position: relative;
				background: none;
				font-family: inherit;
				border-radius: 8px;
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
		}
		.navigation {
			gap: 32px;
			display: flex;
			margin-top: 24px;
			a {
				gap: 12px;
				color: hsl(250 20% 90% / 80%);
				display: flex;
				font-size: 13px;
				transition: color .1s;
				align-items: center;
				&.active, &:hover {
					color: var(--menu-color-hover);
					text-decoration: none;
				}
			}
		}
	}
	main {
		width: 100%;
		height: 100%;
		& > :global(.header) {
			padding: 48px 0;
			background: var(--background-primary);
			border-bottom: 1px solid var(--border-primary);
			:global(h1) {
				margin: 0;
				font-weight: 600;
			}
			:global(p) {
				color: var(--color-secondary);
				margin: 16px 0 0;
				font-size: .9em;
				white-space: pre;
				line-height: normal;
			}
		}
		:global(.geist) {
			width: 1200px;
			margin: 0 auto;
			padding: 0 64px;
			max-width: calc(100vw - 128px);
		}
	}
</style>