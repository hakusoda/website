<script lang="ts">
	import { t } from '$lib/localisation';
    import type { PageData } from './$types';
	import { MellowServerAuditLogType } from '$lib/enums';
    
	import AuditLog from '$lib/components/AuditLog.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [MellowServerAuditLogType.CreateRobloxLink, MellowServerAuditLogType.UpdateRobloxGlobalSettings, MellowServerAuditLogType.UpdateRobloxLink];
</script>

<div class="main">
	{#each data.items as item}
		<AuditLog
			open={open.includes(item.id)}
			text={$t(`mellow_server_audit_log.type.${item.type}`, [item])}
			author={item.author.username}
			avatar={item.author.avatar_url}
			openable={OPENABLE.includes(item.type)}
			createdAt={item.created_at}
			authorName={item.author.name}
			on:click={OPENABLE.includes(item.type) ? () => open = open.includes(item.id) ? open.filter(i => i !== item.id) : [...open, item.id] : null}
		>
			{#if item.type === MellowServerAuditLogType.UpdateRobloxGlobalSettings}
				{#if item.data.default_nickname}
					<p>{$t('mellow_server_audit_log.type.2.default_nickname', [item])}</p>
				{/if}
			{/if}
			{#if item.type === MellowServerAuditLogType.CreateRobloxLink}
				<p>{$t(`mellow_bind.bound.${item.data.type}`, [item.data.targets])}, {$t('mellow_bind.requirements.with', [item.data.requirements])}</p>
			{/if}
			{#if item.type === MellowServerAuditLogType.UpdateRobloxLink}
				{#if item.data.name[1]}
					<p>{$t('mellow_server_audit_log.type.4.name', [item])}</p>
				{/if}
				{#if item.data.type[1]}
					<p>{$t('mellow_server_audit_log.type.4.type', [item])}</p>
				{/if}
				{#if item.data.target_ids}
					<p>{$t('mellow_server_audit_log.type.4.target_ids', [item])}</p>
				{/if}
				{#if item.data.requirements}
					<p>{$t('mellow_server_audit_log.type.4.requirements', [item])}</p>
				{/if}
				{#if item.data.requirements_type[1]}
					<p>{$t('mellow_server_audit_log.type.4.requirements_type', [item])}</p>
				{/if}
			{/if}
		</AuditLog>
	{/each}
</div>

<style lang="scss">
	.main {
		gap: 16px;
		width: 100%;
		margin: 32px;
		display: flex;
		overflow: hidden auto;
		flex-direction: column;
	}
</style>