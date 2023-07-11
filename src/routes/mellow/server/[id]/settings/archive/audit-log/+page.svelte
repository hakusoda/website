<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { hasFlag } from '$lib/util';
    import type { PageData } from './$types';
	import { MellowServerLogType, MellowServerAuditLogType } from '$lib/enums';
    
	import AuditLog from '$lib/components/AuditLog.svelte';
	import AuditLogChange from '$lib/components/AuditLogChange.svelte';

	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [MellowServerAuditLogType.CreateRobloxLink, MellowServerAuditLogType.UpdateRobloxGlobalSettings, MellowServerAuditLogType.UpdateRobloxLink, MellowServerAuditLogType.UpdateLogging];

	const mapLogTypes = (old: number, now: number) =>
		Object.values(MellowServerLogType).filter(i => typeof i === 'number' && i && hasFlag(old, i) && !hasFlag(now, i)).map(i => $t(`mellow_server_logging_type.${i as MellowServerLogType}`));
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
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.2.default_nickname')}
						value={item.data.default_nickname}
					/>
				{/if}
			{:else if item.type === MellowServerAuditLogType.CreateRobloxLink}
				<p>{$t(`mellow_bind.bound.${item.data.type}`, [item.data.targets])}, {$t('mellow_bind.requirements.with', [item.data.requirements])}</p>
			{:else if item.type === MellowServerAuditLogType.UpdateRobloxLink}
				{#if item.data.name[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.name')}
						value={item.data.name}
					/>
				{/if}
				{#if item.data.type[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.type')}
						value={[$t(`mellow_bind.type.${item.data.type[0]}`), $t(`mellow_bind.type.${item.data.type[1]}`)]}
					/>
				{/if}
				{#if item.data.requirements_type[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.requirements_type')}
						value={[$t(`mellow_bind.requirements_type.${item.data.requirements_type[0]}`), $t(`mellow_bind.requirements_type.${item.data.requirements_type[1]}`)]}
					/>
				{/if}
				{#if item.data.target_ids}
					<p>{$t('mellow_server_audit_log.type.4.target_ids', [item])}</p>
				{/if}
				{#if item.data.requirements}
					<p>{$t('mellow_server_audit_log.type.4.requirements', [item])}</p>
				{/if}
			{:else if item.type === MellowServerAuditLogType.UpdateLogging}
				{#if item.data.types[1] !== undefined}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.5.types')}
						diff={[mapLogTypes(item.data.types[0], item.data.types[1]), mapLogTypes(item.data.types[1], item.data.types[0])]}
					/>
				{/if}
				{#if item.data.channel[1] !== undefined}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.5.channel')}
						value={item.data.channel}
					/>
				{/if}
			{/if}
			{#if item.target_link_id || item.type === MellowServerAuditLogType.CreateRobloxLink || MellowServerAuditLogType.UpdateRobloxLink}
				{#if item.target_link_id}
					<a href={`/mellow/server/${$page.params.id}/settings/roblox/binds?highlight=${item.target_link_id}`}>
						{$t('action.view_roblox_link')}<BoxArrowUpRight size={12}/>
					</a>
					<p class="footer">{$t('label.roblox_link_id', [item.target_link_id])}</p>
				{:else}
					<p class="footer">{$t('label.roblox_link_deleted')}</p>
				{/if}
			{/if}
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