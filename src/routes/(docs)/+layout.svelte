<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import BrandIcon from '$lib/icons/BrandIcon.svelte';
	import BrandLogo from '$lib/icons/BrandLogo.svelte';
	import CodeSlash from '$lib/icons/CodeSlash.svelte';
	import MellowFace from '$lib/icons/MellowFace.svelte';
	import HouseDoorFill from '$lib/icons/HouseDoorFill.svelte';
	export let data: LayoutData;

	$: splitPath = $page.url.pathname.split('/');
	$: docsArea = splitPath[1];
	$: paths = {
		docs: [{
			id: 'api',
			icon: CodeSlash
		}, {
			id: 'mellow',
			icon: MellowFace
		}, {
			id: 'platform',
			icon: BrandIcon
		}],
		reference: [{
			id: 'rest-api',
			icon: CodeSlash
		}]
	}[docsArea];

	$: base = splitPath[2];
	$: basePath = `/${docsArea}/${base}`;
</script>

<header>
	<div class="geist">
		<div class="head">
			<BrandLogo size={32}/>
			<div class="navigation">
				<a href="/docs" class:active={$page.url.pathname.startsWith('/docs')}>
					{$t('docs')}
				</a>
				<a href="/reference" class:active={$page.url.pathname.startsWith('/reference')}>
					{$t('reference')}
				</a>
			</div>
			<a href="/" class="home">
				<HouseDoorFill/>{$t('action.return_from_mellow')}
			</a>
		</div>
		<div class="navigation">
			{#each paths as path}
				<a href={`/${docsArea}/${path.id}`} class:active={$page.url.pathname.startsWith(`/${docsArea}/${path.id}`)}>
					<svelte:component this={path.icon}/>
					{$t(`${docsArea}.articles.${path.id}`)}
				</a>
			{/each}
		</div>
	</div>
</header>
<main>
	<div class="geist">
		<div class="navigation">
			<a href={basePath} class:active={$page.url.pathname === basePath}>
				{$t('label.overview')}
			</a>
			{#each data.articles.filter(item => item.url !== basePath && item.url.startsWith(basePath)) as item}
				<a href={item.url} class:active={$page.url.pathname === item.url}>
					{$t(`${docsArea}.articles.${item.url.replace(/^\/\w+\/?/, '').replace(/\//g, '.')}`)}
				</a>
			{/each}
		</div>
		<div class="content">
			<slot/>
		</div>
	</div>
</main>

<style lang="scss">
	header {
		top: -56px;
		z-index: 1;
		position: sticky;
		background: var(--background-primary);
		border-bottom: 1px solid var(--border-primary);
		.geist {
			padding: 16px 32px;
			max-width: calc(100vw - 64px);
		}
		.head {
			gap: 16px;
			color: var(--color-primary);
			display: flex;
			align-items: center;
			.navigation {
				margin: 0 0 0 24px;
				a {
					font-size: 14px;
					&.active, &:hover {
						color: #fff;
						font-weight: 500;
					}
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
		.home {
			gap: 10px;
			margin: 0 0 0 auto;
			display: flex;
			padding: 6px 14px;
			font-size: .8em;
			transition: box-shadow .5s;
			box-shadow: inset 0 0 0 1px var(--border-secondary);
			align-items: center;
			border-radius: 12px;
			&:hover {
				box-shadow: inset 0 0 0 1px #ffffff80;
				text-decoration: none;
			}
		}
	}
	main {
		width: 100%;
		height: 100%;
		.geist {
			height: 100%;
			display: flex;
			.navigation {
				gap: 12px;
				display: flex;
				padding: 32px 24px;
				min-width: 256px;
				border-right: 1px solid var(--border-primary);
				flex-direction: column;
				a {
					color: hsl(250 20% 90% / 80%);
					font-size: .9em;
					transition: color .1s;
					&.active, &:hover {
						color: var(--menu-color-hover);
						text-decoration: none;
					}
				}
			}
			.content {
				width: 100%;
				padding: 16px 64px;
			}
		}
	}
	:global(.geist) {
		width: 1400px;
		margin: 0 auto;
		max-width: 100vw;
	}
</style>