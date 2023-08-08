<script lang="ts">
	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	export let data: PageData;
</script>

<div class="team-roles">
	<h1>{$t('team.settings.access.roles')}</h1>
	<p class="summary">{$t('team.settings.access.roles.summary')}</p>
	<div class="items">
		{#each data.roles as item}
			<div class="item">
				<PeopleFill size={32}/>
				<div class="name">
					<h1>{item.name}</h1>
					<p>
						{$t(`team.created.${!!item.creator}`, [item.created_at])}
						{#if item.creator}
							<a href={`/user/${item.creator.username}`}>
								{item.creator.name || `@${item.creator.username}`}
							</a>
						{/if}
					</p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.team-roles {
		width: 100%;
		margin: 32px 64px;
		:global(.text-input) {
			width: 512px;
		}
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.items {
			gap: 8px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 20px;
				background: var(--background-secondary);
				border-radius: 16px;
				.name {
					margin-left: 16px;
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .8em;
					}
				}
			}
		}
	}
</style>