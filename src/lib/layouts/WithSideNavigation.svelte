<script lang="ts">
	import type { SvelteComponent } from 'svelte';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	export let items: [string, typeof SvelteComponent<any>, string?][] = [];
</script>

<div class="with-side-navigation geist">
	<div class="navigation">
		{#each items as [href, icon, tkey]}
			<a {href} class:active={$page.url.pathname === href}>
				<svelte:component this={icon}/>
				{$t(tkey ?? `side_navigation${href.replace(/\//g, '.')}`)}
			</a>
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
		.navigation {
			gap: 16px;
			top: 128px;
			height: fit-content;
			display: flex;
			position: sticky;
			min-width: 256px;
			flex-direction: column;
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
		.content {
			width: 100%;
			margin-left: 16px;
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