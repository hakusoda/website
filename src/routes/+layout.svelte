<script lang="ts">
	import '$lib/styles/root.scss';
	import '@hakumi/essence/styles.scss';
	import { inject } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	
	import { t } from '$lib/localisation';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { theme } from '$lib/settings';
	import { editor, sudoModal } from '$lib/store';
	import { storeKeyPairForAuthentication } from '$lib/crypto';

	import EnableSudo from '$lib/modals/EnableSudo.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';

	import FloppyFill from '$lib/icons/FloppyFill.svelte';
	import BoxArrowLeft from '$lib/icons/BoxArrowLeft.svelte';
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();

	$: [themeName] = $theme.split('_');

	onMount(storeKeyPairForAuthentication);

	const editorSaving = editor.isSaving;
	const editorCanSave = editor.canSave;
</script>

<div class={`app theme-${themeName}`}>
	<div class="app-container">
		<slot/>
	</div>
	<div id="absolute-solver"/>
	{#if $page.params.role_id}
		<div class="editor-controls">
			<button type="button" on:click={() => editor.callback?.()} disabled={!$editorCanSave || $editorSaving}>
				<FloppyFill/>{$t('action.save_changes')}
			</button>
			<a class="secondary" href={`/team/${$page.params.name}/dashboard/roles`}>
				<BoxArrowLeft/>{$t('action.cancel')}
			</a>
		</div>
	{/if}
	<PageLoader/>
	{#if $sudoModal}
		<EnableSudo/>
	{/if}
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
		overflow: hidden;
		min-height: 100vh;
		background: var(--background-primary);

		--color-link: hsl(330 90% 80%);
		--color-verified: color-mix(in srgb, var(--button-background) 75%, #fff);

		.app-container {
			height: inherit;
			overflow: hidden auto;
			min-height: inherit;
		}
		&:has(.editor-controls) .app-container {
			height: calc(100% - 97px);
			min-height: unset;
		}
	}
	.editor-controls {
		gap: 32px;
		display: flex;
		padding: 32px 0;
		border-top: 1px solid var(--border-primary);
		justify-content: center;
		a, button {
			gap: 12px;
			color: var(--color-primary);
			border: none;
			height: 32px;
			cursor: pointer;
			display: flex;
			padding: 0 16px;
			font-size: .8em;
			background: var(--button-background);
			transition: opacity .5s, background .5s, box-shadow .5s;
			box-shadow: 0 0 0 1px color-mix(in srgb, var(--button-background) 75%, #fff);
			align-items: center;
			font-family: inherit;
			border-radius: 12px;
			&:is(a) {
				background: none;
				box-shadow: 0 0 0 1px var(--color-secondary);
			}
			&:not(:disabled):hover {
				&:not(a) {
					background: color-mix(in srgb, var(--button-background) 90%, #fff);
				}
				&:is(a) {
					box-shadow: 0 0 0 1px #fff;
					text-decoration: none;
				}
			}
			&:disabled {
				cursor: not-allowed;
				opacity: .5;
			}
		}
	}
</style>