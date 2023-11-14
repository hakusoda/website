<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/util';
    import type { PageData } from './$types';
	import { MellowServerLogType, MellowServerAuditLogType } from '$lib/enums';
    
	import AuditLog from '$lib/components/AuditLog.svelte';
	import AuditLogChange from '$lib/components/AuditLogChange.svelte';

	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [MellowServerAuditLogType.CreateProfileSyncAction, MellowServerAuditLogType.UpdateProfileSyncingSettings, MellowServerAuditLogType.UpdateProfileSyncAction, MellowServerAuditLogType.UpdateLogging];

	const mapLogTypes = (old: number, now: number) =>
		Object.values(MellowServerLogType).filter(i => typeof i === 'number' && i && hasBit(old, i) && !hasBit(now, i)).map(i => $t(`mellow_server_logging_type.${i as MellowServerLogType}`));
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
			{#if item.type === MellowServerAuditLogType.UpdateProfileSyncingSettings}
				{#if item.data.default_nickname?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.2.default_nickname')}
						value={item.data.default_nickname}
					/>
				{/if}
				{#if item.data.allow_forced_syncing?.[1] !== undefined}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.2.allow_forced_syncing')}
						value={item.data.allow_forced_syncing}
					/>
				{/if}
			{:else if item.type === MellowServerAuditLogType.CreateProfileSyncAction}
				<p>{$t(`mellow_sync_action.explanation.${item.data.type}`, [item.data.data?.length])}{$t(`mellow_sync_action.explanation.end.${item.data.requirements_type}`, [item.data.requirements])}</p>
			{:else if item.type === MellowServerAuditLogType.UpdateProfileSyncAction}
				{#if item.data.name?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.name')}
						value={item.data.name}
					/>
				{/if}
				{#if item.data.type?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.type')}
						value={[$t(`mellow_sync_action.type.${item.data.type[0]}`), $t(`mellow_sync_action.type.${item.data.type[1]}`)]}
					/>
				{/if}
				{#if item.data.requirements?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.requirements')}
						diff={[item.data.requirements[0].map(i => $t(`mellow_sync_action.requirement.${i.type}`)), item.data.requirements[1].map(i => $t(`mellow_sync_action.requirement.${i.type}`))]}
					/>
				{/if}
				{#if item.data.requirements_type?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.requirements_type')}
						value={[$t(`mellow_sync_action.requirements_type.${item.data.requirements_type[0]}`), $t(`mellow_sync_action.requirements_type.${item.data.requirements_type[1]}`)]}
					/>
				{/if}
				{#if item.data.data?.[1]}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.4.data')}
						value={[item.data.data[0].map((i, j) => `[${j}]: ${i}`).join('\n\n'), item.data.data[1]?.map((i, j) => `[${j}]: ${i}`).join('\n\n')]}
					/>
				{/if}
				<!--{#if item.data.requirements[1]}
					<p>{$t('mellow_server_audit_log.type.4.requirements', [item])}</p>
				{/if}-->
			{:else if item.type === MellowServerAuditLogType.UpdateLogging}
				{#if item.data.types?.[1] !== undefined}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.5.types')}
						diff={[mapLogTypes(item.data.types[0], item.data.types[1]), mapLogTypes(item.data.types[1], item.data.types[0])]}
					/>
				{/if}
				{#if item.data.channel?.[1] !== undefined}
					<AuditLogChange
						name={$t('mellow_server_audit_log.type.5.channel')}
						value={item.data.channel}
					/>
				{/if}
			{/if}
			{#if item.target_link_id || item.type === MellowServerAuditLogType.CreateProfileSyncAction || item.type === MellowServerAuditLogType.UpdateProfileSyncAction}
				{#if item.target_link_id}
					<a href={`/mellow/server/${$page.params.id}/settings/syncing/actions?highlight=${item.target_link_id}`}>
						{$t('action.view_profile_sync_action')}<BoxArrowUpRight size={12}/>
					</a>
					<p class="footer">{$t('label.profile_sync_action_id', [item.target_link_id])}</p>
				{:else}
					<p class="footer">{$t('label.profile_sync_action_deleted')}</p>
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