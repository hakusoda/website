<script lang="ts">
	import '@hakumi/essence/styles.scss';
	import { inject } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	
	import { dev } from '$app/environment';
	import { theme } from '$lib/settings';
	import { storeKeyPairForAuthentication } from '$lib/crypto';
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	$: [themeName] = $theme.split('_');

	onMount(storeKeyPairForAuthentication);
</script>

<div class={`app theme-${themeName}`}>
	<slot/>
</div>

<svelte:head>
	<meta property="og:type" content="website">
	<meta name="theme-color" content="#1e1e20">
	<meta name="og:site_name" content="HAKUMI">
</svelte:head>

<style lang="scss">
	.app {
		width: 100vw;
		height: 100vh;
		display: flex;
		overflow: auto;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;

		--color-link: hsl(330 90% 80%);
		--color-verified: color-mix(in srgb, var(--button-background) 75%, #fff);
	}
	:global(body) {
		overflow: hidden auto;
	}

	:global(a) {
		color: var(--color-primary);
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	:global(.menu-content) {
		min-width: 256px;
	}
</style>