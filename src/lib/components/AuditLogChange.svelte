<script lang="ts">
	import { t } from '../localisation';
	import ArrowRightShort from '../icons/ArrowRightShort.svelte';
	export let name: string;
	export let diff: [any[], any[]] | null = null;
	export let value: [any, any] | null = null;
</script>

<p class="title">{name}</p>
<div class="change">
	{#if value}
		<!--{#if value[0]}
			<p class="old">{#if !value[1]}- {/if}{value[0]}</p>
		{/if}
		{#if value[0] && value[1]}
			<ArrowRightShort size={20}/>
		{/if}
		{#if value[1]}
			<p class="new">{#if !value[0]}+ {/if}{value[1]}</p>
		{/if}-->
		<p class="old">{value[0] ?? $t('label.none')}</p>
		<ArrowRightShort size={20}/>
		<p class="new">{value[1] ?? $t('label.none')}</p>
	{:else if diff}
		<div class="col">
			<div class="row">
				{#each diff[0] as item}
					<p class="old">- {item}</p>
				{/each}
			</div>
			<div class="row">
				{#each diff[1] as item}
					<p class="new">+ {item}</p>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.title {
		font-size: .9em;
	}
	.change {
		gap: 4px;
		display: flex;
		margin-top: -2px;
		.old, .new {
			margin: 0;
			height: 20px;
			display: flex;
			padding: 0 8px;
			align-items: center;
			font-family: monospace;
			border-radius: 4px;
		}
		.old {
			color: #ffdcd7 !important;
			background: #67060c;
		}
		.new {
			color: #aff5b4 !important;
			background: #033a16;
		}
		.col, .row {
			gap: 4px;
			display: flex;
		}
		.col {
			flex-direction: column;
		}
		&:not(:last-child) {
			margin-bottom: 8px;
		}
	}
</style>