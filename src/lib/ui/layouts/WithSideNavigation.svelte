<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	export let items: (string | [string | (() => void), typeof SvelteComponent<any>?, string?, boolean?])[] = [];
</script>

<div class="with-side-navigation geist">
	<div class="navigation">
		{#each items as item}
			{#if typeof item === 'string'}
				{#if item === 'space'}
					<br/>
				{:else}
					<p>{$t(item)}</p>
				{/if}
			{:else}
				{@const [target, icon, display_name, disabled] = item}
				{#if typeof target === 'string'}
					<a href={target} class:active={$page.url.pathname === target} class:disabled>
						<svelte:component this={icon}/>
						{$t(display_name ?? `side_navigation${target.replace(/\//g, '.')}`)}
					</a>
				{:else}
					<button type="button" on:click={target} class:disabled>
						<svelte:component this={icon}/>
						{display_name ? $t(display_name) : 'untitled'}
					</button>
				{/if}
			{/if}
		{/each}
	</div>
	<div class="content">
		<slot/>
	</div>
</div>

<style lang="scss">
	.with-side-navigation {
		display: flex;
		margin-top: 64px;
		margin-bottom: 64px;
		.navigation {
			top: 128px;
			height: fit-content;
			display: flex;
			position: sticky;
			min-width: 256px;
			flex-direction: column;
			p {
				margin: 32px 0 6px;
				font-size: 12px;
			}
			a, button {
				all: unset;
				gap: 12px;
				color: hsl(250 20% 90% / 80%);
				height: 32px;
				display: flex;
				font-size: 13px;
				transition: color .1s;
				align-items: center;
				&.active, &:not(.disabled):hover {
					color: var(--menu-color-hover);
					text-decoration: none;
				}
				&.disabled {
					opacity: .5;
					pointer-events: none; // not ideal... but i'm lazy.
				}
			}
		}
		.content {
			width: 100%;
			display: flex;
			margin-left: 16px;
			flex-direction: column;
			& > :global(.header) {
				margin-bottom: 32px;
				:global(h2) {
					margin: 0;
					font-weight: 600;
				}
				:global(p) {
					color: var(--color-secondary);
					margin: 16px 0 0;
					font-size: .9em;
				}
			}
		}
	}
</style>