<script lang="ts">
	import { onMount } from 'svelte';
	
	import { page } from '$app/state';
	import { PUBLIC_SITE_URL, PUBLIC_SOCIAL_LINK_BLUESKY, PUBLIC_SOCIAL_LINK_DISCORD, PUBLIC_SOCIAL_LINK_GITHUB, PUBLIC_SOCIAL_LINK_ROBLOX, PUBLIC_SOCIAL_LINK_X } from '$env/static/public';
	
	import '$lib/interface/styles/root.scss';
	
	import AsobukazeLogo from '$lib/interface/visuals/asobukaze_logo.svelte';
	import BlueskyIcon from '$lib/interface/visuals/socials/bluesky_icon.svelte';
	import BrandLogo from '$lib/interface/visuals/brand_logo.svelte';
    import DiscordIcon from '$lib/interface/visuals/socials/discord_icon.svelte';
	import GithubIcon from '$lib/interface/visuals/socials/github_icon.svelte';
	import RobloxIcon from '$lib/interface/visuals/socials/roblox_icon.svelte';
	import XIcon from '$lib/interface/visuals/socials/x_icon.svelte';
	
	let header_hover = $state(false);
	onMount(() => header_hover = document.body.scrollTop > 0);
	
	let { children } = $props();
	let pathname = $derived(page.url.pathname);
</script>

<div class="cool_top_blur" class:hover={header_hover}></div>
<nav>
	<div class="header" class:hover={header_hover}>
		<a class="brand_logo" href="/" title="HAKUMI">
			<BrandLogo height={40}/>
		</a>
		<div class="links">
			
		</div>
	</div>
</nav>
<main>
	{@render children()}
</main>
<footer>
	<div class="footer_gradient"></div>
	<div class="footer_contents">
		<div class="brand">
			<div class="studio_logos">
				<a class="brand_logo" href="/" title="HAKUMI">
					<BrandLogo height={56}/>
				</a>
				<a class="brand_logo" href="/" title="ASOBUKAZE">
					<AsobukazeLogo height={56}/>
				</a>
			</div>
			<div class="lower_section">
				<a class="social_logo" href={PUBLIC_SOCIAL_LINK_DISCORD} title="Discord" target="_blank">
					<DiscordIcon size={24}/>
				</a>
				<a class="social_logo" href={PUBLIC_SOCIAL_LINK_BLUESKY} title="Bluesky" target="_blank">
					<BlueskyIcon size={24}/>
				</a>
				<a class="social_logo" href={PUBLIC_SOCIAL_LINK_X} title="X" target="_blank">
					<XIcon size={24}/>
				</a>
				<a class="social_logo" href={PUBLIC_SOCIAL_LINK_ROBLOX} title="Roblox" target="_blank">
					<RobloxIcon size={24}/>
				</a>
				<a class="social_logo" href={PUBLIC_SOCIAL_LINK_GITHUB} title="GitHub" target="_blank">
					<GithubIcon size={24}/>
				</a>
				<p class="legal" aria-hidden="true">
					© 2025 HAKUMI
				</p>
			</div>
		</div>
		<div class="links">
			<a href="/" title="(soon, use this page for now)">
				About us
			</a>
			<a href="/" title="(soon)">
				Open Source
			</a>
		</div>
	</div>
</footer>

<svelte:document on:scroll={() => header_hover = document.documentElement.scrollTop > 0}/>
<svelte:head>
	{#key pathname}
		<meta property="og:url" content="{PUBLIC_SITE_URL}{pathname}"/>
	{/key}
</svelte:head>

<style lang="scss">
	.cool_top_blur {
		background: color-mix(in oklab, hsl(350 12% 8%) 80%, transparent);
		height: 96px;
		left: 0;
		mask-image: linear-gradient(to bottom, #000 20%, transparent 80%);
		opacity: 0;
		position: fixed;
		top: 0;
		transition: opacity .5s;
		width: 100%;
		z-index: 10;
		&.hover {
			opacity: 1;
		}
	}
	nav {
		left: 0;
		padding: 0 16px;
		position: fixed;
		top: 0;
		width: 100%;
		z-index: 10;
		.header {
			align-items: center;
			border-radius: 24px;
			display: flex;
			height: 64px;
			margin: 16px auto;
			max-width: 1200px;
			padding: 16px 32px;
			transition: background .2s, box-shadow .2s, padding .5s;
			&.hover {
				backdrop-filter: blur(16px);
				background: hsla(350, 10%, 5%, .3);
				box-shadow: inset 0 0 0 1px hsla(350, 20%, 40%, .15);
				padding: 16px 24px;
			}
			.brand_logo {
				color: #fff;
				line-height: 0;
				margin: 0 16px 0 0;
			}
			.links {
				margin: 0 0 0 auto;
				a {
					color: #fff;
					font-weight: 500;
					text-decoration: none;
				}
			}
		}
	}
	main {
		min-height: calc(100vh - 94px);
		margin: 0 auto;
		max-width: 1200px;
		padding: 80px 16px;
		width: 100%;
	}
	footer {
		background: linear-gradient(to bottom, hsl(350, 12%, 7%), hsl(10, 40%, 6%));
		border-radius: 24px 24px 0 0;
		border-top: 1px solid hsl(350, 20%, 13%);
		overflow: hidden;
		position: relative;
		.footer_gradient {
			background: #d22f661a;
			border-radius: 50%;
			bottom: 0;
			content: '';
			filter: blur(60px);
			height: 50px;
			left: 50%;
			max-width: 1000px;
			position: absolute;
			transform: translate(-50%, 60%);
			width: 70%;
		}
		.footer_contents {
			align-items: center;
			display: flex;
			margin: auto auto 0 auto;
			max-width: 1200px;
			padding: 48px 16px;
			width: 100%;
		}
		.studio_logos {
			align-items: center;
			display: flex;
			gap: 24px;
			.brand_logo {
				color: #fff;
				line-height: 0;
			}
		}
		.lower_section {
			align-items: center;
			display: flex;
			gap: 12px;
			margin-top: 24px;
			.social_logo {
				color: #fff;
				line-height: 0;
			}
			.legal {
				font-family: 'Outfit', sans-serif;
				font-size: .9em;
				font-weight: 500;
				margin: 0 12px 0 auto;
			}
		}
		.links {
			display: flex;
			gap: 32px;
			margin-left: auto;
			a {
				color: var(--color-secondary);
				font-size: .9em;
				font-weight: 450;
				text-decoration: none;
				transition: color .5s;
				&:hover {
					color: var(--color-secondary-hover);
				}
			}
		}
	}
</style>