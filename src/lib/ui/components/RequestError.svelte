<script lang="ts">
	import { t } from '../localisation';
	import type { RequestError } from '$lib/shared/types';

	import ArrowRightShort from 'virtual:icons/bi/arrow-right-short';
	export let data: RequestError | null = null;
	export let background = 'var(--background-secondary)';
</script>

{#if data}
	<div class="request-error" style={`--bg: ${background}`}>
		<div class="container message">
			<p>{$t(`request_error.${data.error}`)}</p>
		</div>
		{#if data.issues?.length}
			<div class="container zod-issues">
				<p class="title">{$t('request_error.zod')}</p>
				{#each data.issues as item}
					<div class="item">
						<p class="path">
							{#each item.path as key, index}
								{#if index && index < item.path.length}
									<ArrowRightShort/>
								{/if}
								{key}
							{/each}
						</p>
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
		padding: 16px 24px;
		position: relative;
		margin-top: 24px;
		background: #ffffff0d;
		border-radius: 20px;
		flex-direction: column;
		.title {
			top: -10px;
			left: 18px;
			color: var(--color-secondary);
			padding: 4px 6px;
			position: absolute;
			font-size: 12px;
			background: var(--bg);
			font-weight: 500;
		}
		&.message {
			background: #ff76761a;
			border-color: #ff767680;
			p {
				color: #ffdada;
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
					gap: 2px;
					color: #fff;
					margin: 0;
					display: flex;
					padding: 4px 6px;
					background: #ff767680;
					align-items: center;
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