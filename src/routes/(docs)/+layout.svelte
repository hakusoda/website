<script lang="ts">
	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import BrandIcon from '$lib/ui/icons/BrandIcon.svelte';
	import BrandLogo from '$lib/ui/icons/BrandLogo.svelte';
	import CodeSlash from 'virtual:icons/bi/code-slash';
	import MellowFace from '$lib/ui/icons/MellowFace.svelte';
	import HouseDoorFill from 'virtual:icons/bi/house-door-fill';
	export let data;

	$: splitPath = $page.url.pathname.split('/');
	$: current_section = splitPath[1];
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
	}[current_section]!;

	$: base = splitPath[2];
	$: section_base_path = `/${current_section}/${base}`;

	$: pages = data.articles
		.filter(item => item.url !== section_base_path && item.url.startsWith(section_base_path));
	$: pages2 = Object.entries(
		pages
			.sort((a, b) => (a.metadata?.position ?? pages.indexOf(a)) - (b.metadata?.position ?? pages.indexOf(b)))
			.reduce((acc, value) => {
				const split = value.url.split('/');
				const category = split.length === 5 ? `${split[2]}.${split[3]}` : '';
				(acc[category] ??= []).push(value);

				return acc;
			}, {} as Record<string, typeof pages>)
	);
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
				{@const href = `/${current_section}/${path.id}`}
				<a {href} class:active={$page.url.pathname.startsWith(href)}>
					<svelte:component this={path.icon}/>
					{$t(`${current_section}.articles.${path.id}`)}
				</a>
			{/each}
		</div>
	</div>
</header>
<main>
	<div class="geist">
		<div class="navigation">
			<a href={section_base_path} class:active={$page.url.pathname === section_base_path}>
				{$t('label.overview')}
			</a>
			{#each pages2 as [category, items]}
				{#if category}
					<p>{$t(`${current_section}.articles.${category}`)}</p>
				{/if}
				{#each items as item}
					<a href={item.url} class:active={$page.url.pathname === item.url}>
						{$t(`${current_section}.articles.${item.url.replace(/^\/\w+\/?/, '').replace(/\//g, '.')}`)}
					</a>
				{/each}
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
				height: 100%;
				display: flex;
				padding: 32px 24px;
				min-width: 256px;
				border-right: 1px solid var(--border-primary);
				flex-direction: column;
				p {
					margin: 32px 0 6px;
					font-size: 13px;
				}
				a {
					all: unset;
					color: hsl(250 20% 90% / 80%);
					height: 32px;
					display: flex;
					font-size: 14px;
					transition: color .1s;
					align-items: center;
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