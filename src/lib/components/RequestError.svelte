<script lang="ts">
	import { t } from '../localisation';
	import type { RequestError } from '../types';
	export let data: RequestError | null = null;
</script>

{#if data}
	<div class="request-error">
		<div class="container message">
			<p class="title">{$t('request_error.title')}</p>
			<p class="message">{$t(`request_error.${data.error_id}`)}</p>
		</div>
		{#if data.zod_issues?.length}
			<div class="container zod-issues">
				<p class="title">{$t('request_error.zod')}</p>
				{#each data.zod_issues as item}
					<div class="item">
						<p class="path">{item.path.join('.')}</p>
						<p class="message">{$t(`zod_issue.${item.code}`, [item])}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style lang="scss">
	.container {
		gap: 8px;
		border: 1px solid var(--border-secondary);
		display: flex;
		padding: 16px;
		position: relative;
		margin-top: 24px;
		border-radius: 8px;
		flex-direction: column;
		.title {
			top: -10px;
			left: 6px;
			color: var(--color-secondary);
			padding: 4px 6px;
			position: absolute;
			font-size: .75em;
			background: var(--background-secondary);
		}
		&.message {
			border-color: #ff767680;
			.title {
				color: #ff8b8b;
			}
			.message {
				margin: 0;
				font-size: .9em;
			}
		}
		&.zod-issues {
			.item {
				display: flex;
				font-size: .9em;
				align-items: center;
				.path {
					color: #fff;
					margin: 0;
					padding: 4px 6px;
					background: #ff767680;
					font-family: monospace;
					border-radius: 4px;
				}
				.message {
					margin: 0 0 0 8px;
				}
			}
		}
	}
</style>