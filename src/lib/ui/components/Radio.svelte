<script lang="ts">
	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	export let value: boolean;
	export let disabled = false;
	export let onChange: ((newValue: boolean) => void) | null = null;
</script>

<button type="button" class="focusable" class:value {disabled} on:click={() => (value = !value, onChange?.(value))}>
	{#if value}
		<Check/>
	{:else}
		<X font-size={12}/>
	{/if}
</button>

<style lang="scss">
	button {
		width: 24px;
		color: var(--color-secondary);
		border: none;
		height: 24px;
		cursor: pointer;
		padding: 0;
		display: flex;
		background: none;
		transition: color .25s, background .25s, box-shadow .25s;
		box-shadow: inset 0 0 0 1px var(--border-secondary);
		align-items: center;
		border-radius: 4px;
		justify-content: center;
		&.value {
			color: var(--button-color);
			box-shadow: none;
			background: var(--button-background);
		}
		&:not(:disabled):hover {
			color: var(--button-color);
			box-shadow: inset 0 0 0 1px var(--button-background);
			&.value {
				background: none;
				box-shadow: inset 0 0 0 1px var(--button-background);
			}
		}
		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
</style>