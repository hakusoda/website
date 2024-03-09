<script lang="ts">
	import { t } from '$lib/ui/localisation/index';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	export let data;
</script>

<div class="header">
	<h2>{$t('team.settings.developer.applications')}</h2>
</div>
<div class="items">
	{#each data.applications as item}
		<div class="item">
			<Avatar id={item.id} src={item.avatar_url} size="xs"/>
			<div class="details">
				<p class="name">{item.name}</p>
				<p class="summary">{item.summary}</p>
			</div>
			<p class="created">
				{$t('time_ago.created', [item.created_at])}
			</p>
		</div>
	{/each}
</div>

<style lang="scss">
	.items {
		gap: 16px;
		display: flex;
		flex-direction: column;
		.item {
			height: 64px;
			display: flex;
			padding: 0 28px;
			background: var(--background-secondary);
			align-items: center;
			border-radius: 32px;
			.details {
				margin: 0 auto 0 24px;
				.name {
					gap: 8px;
					margin: 0;
					display: flex;
					line-height: 1;
					font-weight: 500;
				}
				.summary {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .8em;
				}
			}
			.created {
				color: var(--color-secondary);
				margin: 0 24px;
				font-size: .8em;
			}
		}
	}
</style>