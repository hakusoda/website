<script lang="ts">
	import { t } from '$lib/ui/localisation/index';

	import ApplicationsListItem from '$lib/ui/components/ApplicationsListItem.svelte';
	export let data;
</script>

<div class="main">
	<h1>{$t('settings.integrations.applications')}</h1>
	<p class="summary">{$t('settings.integrations.applications.summary')}</p>
	
	<div class="applications">
		{#each data.applications as item}
			<ApplicationsListItem {...item}/>
		{/each}
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0 64px 32px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.applications {
			gap: 16px;
			margin: 32px 0 0;
			display: flex;
			flex-direction: column;
		}
	}
</style>