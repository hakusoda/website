<script lang="ts">
	export let title: string | null = null;
	export let value: number | boolean;
	export let items: string[] = [];
</script>

<div class="segmented-control">
	{#if title}
		<p>{title}</p>
	{/if}
	<div class="segmented-control-buttons">
		{#if typeof value === 'number'}
			{#each items as text, index}
				<button type="button" class="focusable" class:active={index === value} on:click={() => value = index}>
					{text}
				</button>
			{/each}
		{:else}
			<button type="button" class="focusable" class:active={value} on:click={() => value = true}>
				<slot name="true"/>
			</button>
			<button type="button" class="focusable" class:active={!value} on:click={() => value = false}>
				<slot name="false"/>
			</button>
		{/if}
	</div>
</div>

<style lang="scss">
	.segmented-control {
		width: fit-content;
		margin: auto 0 8px;
		height: fit-content;
		display: flex;
		align-items: center;
		p {
			color: var(--color-secondary);
			margin: 0 16px 0 0;
			font-size: .9em;
		}
		.segmented-control-buttons {
			gap: 4px;
			display: flex;
			background: #ffffff1a;
			border-radius: 8px;
			button {
				color: var(--color-tertiary);
				margin: 4px;
				border: none;
				cursor: pointer;
				padding: 2px 8px;
				font-size: .75em;
				background: none;
				font-family: var(--font-primary);
				border-radius: 4px;
				&.active {
					color: var(--color-primary);
					margin: 0;
					padding: 6px 12px;
					background: var(--background-secondary);
					box-shadow: 0 0 0 1px var(--color-secondary);
					font-weight: 500;
					border-radius: 8px;
				}
				&:not(.active):hover {
					color: var(--color-primary);
					background: var(--background-tertiary);
				}
			}
		}
	}
</style>