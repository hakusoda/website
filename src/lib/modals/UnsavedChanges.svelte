<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';

	import Hourglass from '$lib/icons/Hourglass.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	import ArrowClockwise from '$lib/icons/ArrowClockwise.svelte';
	import ExclamationOctagonFill from '$lib/icons/ExclamationOctagonFill.svelte';
	import ExclamationTriangleFill from '$lib/icons/ExclamationTriangleFill.svelte';
	export let show = false;
	export let save: () => void;
	export let error: string = '';
	export let reset: (() => void) | null = null;
	export let saving = false;
</script>

<div class="unsaved-changes" class:show class:error>
	{#if saving}
		<Hourglass size={28}/>
	{:else if error}
		<ExclamationOctagonFill size={28}/>
	{:else}
		<ExclamationTriangleFill size={28}/>
	{/if}
	<div class="details">
		{#if error}
			<h1>{$t('modal.unsaved_changes.error')}</h1>
			<p>{error}</p>
		{:else}
			<h1>{$t(saving ? 'modal.unsaved_changes.saving' : 'modal.unsaved_changes')}</h1>
		{/if}
	</div>
	<Button on:click={save} disabled={!show || saving}>
		{#if saving}
			<Hourglass/>
		{:else}
			<PencilFill/>
		{/if}
		{$t(error ? 'action.try_again' : 'action.save_changes')}
	</Button>
	{#if reset}
		<button class="reset focusable" type="button" on:click={reset} disabled={!show || saving}>
			<ArrowClockwise/>{$t('action.reset')}
		</button>
	{/if}
</div>

<style lang="scss">
	.unsaved-changes {
		left: 50vw;
		width: 75vw;
		bottom: 32px;
		display: flex;
		padding: 16px 24px;
		position: fixed;
		transform: translate(-50%, calc(100% + 64px));
		transition: transform .35s, background .5s, box-shadow .5s;
		box-shadow: 0 8px 16px 0 #00000040, inset 0 0 0 1px var(--border-secondary);
		background: var(--background-secondary);
		align-items: center;
		border-radius: 16px;
		.details {
			margin: 0 auto 0 16px;
			h1 {
				margin: 0;
				font-size: 1em;
				font-weight: 500;
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: .8em;
				transition: color .5s;
			}
		}
		.reset {
			gap: 8px;
			color: var(--color-primary);
			height: 32px;
			border: none;
			cursor: pointer;
			display: flex;
			padding: 0 16px;
			font-size: 12px;
			background: none;
			box-shadow: inset 0 0 0 1px var(--color-secondary);
			font-weight: 450;
			margin-left: 16px;
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 4px;
			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
			&:not(:disabled):hover {
				box-shadow: inset 0 0 0 1px var(--color-primary);
			}
		}
		&.show {
			transform: translateX(-50%);
		}
		&.error {
			background: color-mix(in srgb, var(--background-secondary) 90%, #ff0000);
			box-shadow: 0 8px 16px 0 #00000040, inset 0 0 0 1px color-mix(in srgb, var(--border-secondary) 90%, #ff0000);
			p {
				color: color-mix(in srgb, var(--color-secondary) 90%, #ff0000);
			}
		}
	}
</style>