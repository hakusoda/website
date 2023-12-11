<script lang="ts">
	import { t } from '$lib/localisation';
    import type { PageData } from './$types';
	import { TeamAuditLogType } from '$lib/enums';
    
	import AuditLog from '$lib/components/AuditLog.svelte';
	import AuditLogChange from '$lib/components/AuditLogChange.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [TeamAuditLogType.UpdateRole, TeamAuditLogType.UpdateProfile];
</script>

<div class="main">
	{#each data.items as item}
		<AuditLog
			open={open.includes(item.id)}
			text={$t(`team_audit_log.type.${item.type}`, [item])}
			author={item.author}
			openable={OPENABLE.includes(item.type)}
			createdAt={item.created_at}
			target_user={item.target_user}
			on:click={OPENABLE.includes(item.type) ? () => open = open.includes(item.id) ? open.filter(i => i !== item.id) : [...open, item.id] : null}
		>
			{#if item.type === TeamAuditLogType.UpdateRole}
				{#if item.data.name[1]}
					<AuditLogChange
						name={$t('team_audit_log.type.9.name')}
						value={item.data.name}
					/>
				{/if}
				{#if item.data.position?.[1] !== null}
					<AuditLogChange
						name={$t('team_audit_log.type.9.position')}
						value={item.data.position}
					/>
				{/if}
				{#if item.data.permissions?.[1] !== null}
					<AuditLogChange
						name={$t('team_audit_log.type.9.permissions')}
						value={item.data.permissions}
					/>
				{/if}
			{/if}
		</AuditLog>
	{/each}
</div>

<style lang="scss">
	.main {
		gap: 16px;
		display: flex;
		flex-direction: column;
	}
</style>