<script lang="ts">
	import type { MellowServerAuditLogType } from '$lib/types';
	
	import AuditLog from './AuditLog.svelte';
	export let items: {
		data: any
		text: string
		type: MellowServerAuditLogType
		author: {
			id: string
			name: string | null
			username: string
			avatar_url: string | null
		}
		created_at: string
		target_user?: {
			name: string | null
			username: string
		} | null
		target_action?: {
			name: string
		} | null
	}[];

	$: i = items.reduce((items, value) => {
		const key = new Date(value.created_at).toLocaleString(undefined, { year: 'numeric', month: 'long' });
		return {
			...items,
			[key]: [
				...items[key] ?? [],
				value
			]
		};
	}, {} as Record<string, typeof items>);
</script>

<div class="audit-log-list">
	{#each Object.entries(i) as [period, items]}
		<h3>{period}</h3>
		{#each items as item}
			<AuditLog {...item}/>
		{/each}
	{/each}
</div>

<style lang="scss">
	.audit-log-list {
		gap: 24px;
		display: flex;
		flex-direction: column;
		h3 {
			margin: 0;
			font-weight: 600;
			&:not(:first-child) {
				margin-top: 32px;
			}
		}
	}
</style>