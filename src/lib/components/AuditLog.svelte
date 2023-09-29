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
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<svelte:element this={openable ? 'button' : 'div'} type="button" class="header" on:click>
		<Avatar src={avatar} size="xs" circle/>
		<div class="details">
			<h1>
				<a href={`/user/${author}`}>
					{authorName ?? `@${author}`}
				</a>
				{text}
			</h1>
		</div>
		<p class="created">{$t('time_ago', [createdAt])}</p>
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
		width: 100%;
		transition: box-shadow .5s;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-primary);
		border-radius: 32px;
		.header {
			width: -webkit-fill-available;
			border: none;
			height: 64px;
			display: flex;
			padding: 0 28px;
			font-size: 1em;
			background: none;
			text-align: start;
			align-items: center;
			font-family: var(--font-primary);
			.details {
				margin: 0 auto 0 24px;
				h1 {
					color: var(--color-secondary);
					margin: 0;
					font-size: 1em;
					font-weight: 400;
					a {
						font-weight: 500;
					}
				}
				p {
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
			:global(svg) {
				color: var(--color-primary);
			}
			&:is(button) {
				cursor: pointer;
			}
		}
		& > .details {
			gap: 8px;
			display: flex;
			padding: 16px 24px 24px;
			border-top: 1px solid var(--border-primary);
			flex-direction: column;
			:global(p) {
				color: var(--color-secondary);
				margin: 0;
				font-size: .9em;
			}
			:global(a) {
				gap: 8px;
				width: fit-content;
				color: var(--color-link);
				margin: 8px 0 0;
				display: flex;
				font-size: .9em;
				align-items: center;
			}
			:global(.footer) {
				color: var(--color-secondary);
				font-size: .75em;
			}
		}
		&:has(.header:is(button):hover) {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
	}
</style>