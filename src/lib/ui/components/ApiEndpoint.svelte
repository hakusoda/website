<script lang="ts">
	export let path: string;
	export let title: string;
	export let method: 'GET';
	export let description: string;
</script>

<div class="api-endpoint">
	<div class="info">
		<h2>{title}</h2>
		<div class="path">
			<p class={`method ${method}`}>
				{method}
			</p>
			<p class="itself">
				{path.replace('[', '{').replace(']', '}')}
			</p>
		</div>
		<p class="description">
			{description.replace('\\n', '\n')}
		</p>
	</div>
</div>

<style lang="scss">
	.api-endpoint {
		padding: 24px 0;
		border-bottom: 1px solid var(--border-primary);
		.info {
			h2 {
				margin: 0;
				font-weight: 600;
			}
			.path {
				margin: 16px 0 0;
				display: flex;
				align-items: center;
				.method {
					width: fit-content;
					margin: 0;
					padding: 5px 8px;
					font-size: 13px;
					font-weight: 450;
					line-height: 13px;
					border-radius: 4px;
					&.GET {
						background: hsl(120 35% 45%);
					}
				}
				.itself {
					color: var(--color-secondary);
					margin: 0 0 0 12px;
				}
			}
			.description {
				margin: 16px 0 0;
				font-size: .9em;
				white-space: pre;
				line-height: 1.5;
			}
		}
	}
</style>