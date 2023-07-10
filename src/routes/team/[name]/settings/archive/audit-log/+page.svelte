<script lang="ts">
	import { t } from '$lib/localisation';
    import type { PageData } from './$types';
	import { TeamAuditLogType } from '$lib/enums';
    
	import AuditLog from '$lib/components/AuditLog.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [TeamAuditLogType.UpdateProfile];
</script>

<div class="main">
	{#each data.items as item}
		<AuditLog
			open={open.includes(item.id)}
			text={$t(`team_audit_log.type.${item.type}`, [item])}
			author={item.author.username}
			avatar={item.author.avatar_url}
			openable={OPENABLE.includes(item.type)}
			createdAt={item.created_at}
			authorName={item.author.name}
			on:click={OPENABLE.includes(item.type) ? () => open = open.includes(item.id) ? open.filter(i => i !== item.id) : [...open, item.id] : null}
		>
			
		</AuditLog>
	{/each}
</div>

<style lang="scss">
	.main {
		gap: 16px;
		width: 100%;
		padding: 32px;
		display: flex;
		overflow: hidden auto;
		flex-direction: column;
	}
</style>