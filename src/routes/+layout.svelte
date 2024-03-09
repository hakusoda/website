<script lang="ts">
	import '$lib/ui/styles/root.scss';
	import '@hakumi/essence/styles.scss';
	import { inject } from '@vercel/analytics';
	import { onMount } from 'svelte';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	
	import { t } from '$lib/ui/localisation';
	import { dev } from '$app/environment';
	import { page } from '$app/stores';
	import { theme } from '$lib/client/settings';
	import { editor, sudoModal } from '$lib/client/store';
	import { store_auth_key_pair } from '$lib/client/crypto';

	import EnableSudo from '$lib/ui/modals/EnableSudo.svelte';
	import PageLoader from '$lib/ui/components/PageLoader.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	import Hourglass from 'virtual:icons/bi/hourglass';
	import FloppyFill from 'virtual:icons/bi/floppy-fill';
	import BoxArrowLeft from 'virtual:icons/bi/box-arrow-left';
	inject({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
	onMount(store_auth_key_pair);

	const editorSaving = editor.isSaving;
	const editorCanSave = editor.canSave;

	$: editorTargetId = $page.params.role_id || $page.params.action_id || $page.params.webhook_id;
	$: editorCreating = editorTargetId === 'create';
</script>

<div class={`app theme-${$theme}`}>
	<div class="app-container">
		<slot/>
	</div>
	<div id="absolute-solver"/>
	{#if editorTargetId}
		<div class="editor-controls">
			<button type="button" on:click={() => editor.callback?.()} disabled={!$editorCanSave || $editorSaving}>
				{#if editorCreating}<Plus/>{:else}{#if $editorSaving}<Hourglass/>{:else}<FloppyFill/>{/if}{/if}
				{$t(editorCreating ? 'action.create' :'action.save_changes')}
			</button>
			<a class="secondary" href={$page.url.pathname.replace(/\/[^\/]*?$/, '')}>
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
	<meta name="og:image" content="/apple-touch-icon.png">
	<meta name="description" content="a wondrous journey into the endless basket!">
	<link rel="apple-touch-icon" href="/apple-touch-icon.png">
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