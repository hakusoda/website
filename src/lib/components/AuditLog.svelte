<script lang="ts">
	import { t } from '../localisation';

	import Avatar from './Avatar.svelte';

	import CaretDown from '../icons/CaretDown.svelte';
	export let text: string;
	export let open: boolean;
	export let author: string;
	export let avatar: string;
	export let openable: boolean;
	export let createdAt: string;
	export let authorName: string | null = null;
</script>

<div class="audit-log">
	<svelte:element this={openable ? 'button' : 'div'} type="button" class="header focusable" on:click>
		<Avatar src={avatar} size="sm" circle/>
		<div class="details">
			<h1><a href={`/user/${author}`}>{authorName ?? `@${author}`}</a> {text}</h1>
			<p>{$t('time_ago', [createdAt])}</p>
		</div>
		{#if openable}
			<CaretDown/>
		{/if}
	</svelte:element>
	{#if open}
		<div class="details">
			<slot/>
		</div>
	{/if}
</div>

<style lang="scss">
	.audit-log {
		background: var(--background-secondary);
		border-radius: 16px;
		.header {
			width: 100%;
			border: none;
			padding: 8px;
			display: flex;
			font-size: 1em;
			background: none;
			text-align: start;
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 16px;
			.details {
				margin-left: 16px;
				h1 {
					color: var(--color-tertiary);
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
			:global(svg) {
				color: var(--color-primary);
				margin: 0 16px 0 auto;
			}
			&:is(button) {
				cursor: pointer;
			}
		}
		& > .details {
			padding: 16px;
			border-top: 1px solid var(--border-secondary);
			:global(p) {
				color: var(--color-tertiary);
				margin: 0;
				font-size: .9em;
			}
		}
	}
</style>