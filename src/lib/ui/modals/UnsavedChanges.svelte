<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';

	import Hourglass from 'virtual:icons/bi/hourglass';
	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import ArrowClockwise from 'virtual:icons/bi/arrow-clockwise';
	import ExclamationOctagonFill from 'virtual:icons/bi/exclamation-octagon-fill';
	import ExclamationTriangleFill from 'virtual:icons/bi/exclamation-triangle-fill';
	export let show = false;
	export let save: () => void;
	export let error: string = '';
	export let reset: (() => void) | null = null;
	export let saving = false;
</script>

<div class="unsaved-changes" class:show class:error>
	{#if saving}
		<Hourglass font-size={28}/>
	{:else if error}
		<ExclamationOctagonFill font-size={28}/>
	{:else}
		<ExclamationTriangleFill font-size={28}/>
	{/if}
	<div class="details">
		{#if error}
			<h1>{$t('modal.unsaved_changes.error')}</h1>
			<p>{error}</p>
		{:else}
			<h1>{$t(saving ? 'modal.unsaved_changes.saving' : 'modal.unsaved_changes')}</h1>
		{/if}
	</div>
	<div class="buttons">
		<Button on:click={save} disabled={!show || saving}>
			{#if saving}
				<Hourglass/>
			{:else}
				<PencilFill/>
			{/if}
			{$t(error ? 'action.try_again' : 'action.save_changes')}
		</Button>
		{#if reset}
			<Button colour="secondary" on:click={reset} disabled={!show || saving}>
				<ArrowClockwise/>{$t('action.reset')}
			</Button>
		{/if}
	</div>
</div>

<style lang="scss">
	.unsaved-changes {
		left: 50vw;
		width: 75vw;
		bottom: 32px;
		display: flex;
		padding: 16px 16px 16px 32px;
		position: fixed;
		transform: translate(-50%, calc(100% + 32px));
		transition: transform .35s, background .5s, box-shadow .5s;
		box-shadow: 0 8px 16px 0 #00000040, inset 0 0 0 1px var(--border-secondary);
		background: var(--background-secondary);
		align-items: center;
		border-radius: 36px;
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
		.buttons {
			gap: 16px;
			display: flex;
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