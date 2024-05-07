<script lang="ts">
	import { t } from '../localisation';
	export let tv: string | null = null;
	export let name = 'unknown';
	export let type: 'changed' | 'rename' | 'with' | 'with2' = (name === 'name' || name === 'display_name') ? 'rename' : 'changed';
	export let value: any = null;
	export let change: [any, any] | undefined | null = null;

	const mapValue = (value: any) => value !== null ? tv ? $t(tv.replace('%', value) as '143') : value : $t('label.none');

	$: display_name = name === 'display_name' ? 'name' : name;
</script>

{#if value || !change || (change[0] !== change[1] && change[1] !== null)}
	<p class="action-log-detail">
		{#if value !== null || (change && typeof change[0] !== 'object')}
			{#if change && type === 'changed'}
				{#if typeof change[0] === 'boolean'}
					{#if change[1] ?? change[0]}Enabled{:else}Disabled{/if}
					{display_name}
				{:else}
					Changed {display_name} from
					<p class="old">{mapValue(change[0])}</p>
					to
					<p class="new">{mapValue(change[1])}</p>
				{/if}
			{:else if type === 'with'}
				With {display_name} <b>{mapValue(value)}</b>
			{:else if type === 'with2'}
				With {value}
			{:else if change}
				Renamed from <b>{change[0]}</b> to <b>{change[1]}</b>
			{/if}
		{:else}
			Changed {display_name}
		{/if}
	</p>
{/if}

<style lang="scss">
	.action-log-detail {
		color: var(--color-secondary);
		margin: 16px 48px;
		font-size: 13px;
		&:first-of-type {
			margin-top: 8px;
		}
		&:last-child {
			margin-bottom: 0;
		}
		.old, .new {
			margin: 0 4px;
			display: inline;
			white-space: pre-line;
			font-family: monospace;
			border-radius: 4px;
			text-overflow: ellipsis;
		}
		.old {
			color: #ffdcd7 !important;
		}
		.new {
			color: #aff5b4 !important;
		}
	}
</style>