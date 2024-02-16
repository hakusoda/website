<script lang="ts">
	import './ActionLogItem.scss';
	import { t } from '../localisation';
	import { page } from '$app/stores';
	import type { ActionLogItem } from '../types';

	import Avatar from './Avatar.svelte';
	import ActionLogItemDetail from './ActionLogItemDetail.svelte';

	import Link from 'virtual:icons/bi/link-45deg';
	import Webhook from '$lib/icons/Webhook.svelte';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data: ActionLogItem;

	$: text = $t(`action_log.type.${data.type}`, [data]);

	const n = (value: string[] | string | undefined) => Array.isArray(value) ? value[0] : value;
</script>

<div class="action-log-item">
	<div class="header">
		<Avatar src={data.author.avatar_url} size="xs" circle/>
		<p class="text">
			{#if $page.data.session?.sub === data.author.id}
				<b>{$t('label.you_monster')}</b>
			{:else}
				<a href={`/user/${data.author.username}`}>
					{data.author.name ?? `@${data.author.username}`}
				</a>
			{/if}
			{#each text.split(' ') as item}
				{#if item === '{user}'}
					{#if data.target_user}
						<a href={`/user/${data.target_user.username}`}>
							{data.target_user.name ?? `@${data.target_user.username}`}</a>&nbsp
					{:else}
						<b class="deleted">{$t('action_log.unknown_user')}</b>
					{/if}
				{:else if item === '{mellow_sync_action}'}
					<b class:deleted={!data.target_action}><Link/>{#if data.target_action}{data.target_action.name}{:else}{n(data.data?.name) ?? $t('action_log.unknown_mellow_action')}{/if}</b>
				{:else if item === '{mellow_webhook}'}
					{#if data.target_webhook}
						<a href={`/mellow/server/${$page.params.id}/settings/webhooks/${data.target_webhook.id}`}>
							<Webhook/>{data.target_webhook.name}
						</a>
					{:else}
						<b class="deleted">
							<Webhook/>{n(data.data?.name) ?? $t('action_log.unknown_webhook')}
						</b>
					{/if}
				{:else if item === '{team_role}'}
					{#if data.target_team_role}
						<a href={`/team/${$page.params.name}/dashboard/roles/${data.target_team_role.id}`}>
							<PeopleFill/>{data.target_team_role.name}
						</a>
					{:else}
						<b class="deleted">
							<PeopleFill/>{n(data.data?.name) ?? $t('action_log.unknown_team_role')}
						</b>
					{/if}
				{:else if /^\*\*.*\*\*$/.test(item)}
					<b>{item.slice(2, -2)}&nbsp</b>
				{:else}
					{item}&nbsp
				{/if}
			{/each}
		</p>
		<p class="created">{$t('days_ago', [data.created_at])}</p>
	</div>
	{#if data}
		{#if data.type === 'mellow.server.syncing.action.created'}
			<ActionLogItemDetail name="name" type="with" value={data.data.name}/>
			<ActionLogItemDetail name="type" type="with" value={data.data.type} tv="mellow_sync_action.type.%"/>
			<ActionLogItemDetail type="with2" value={$t('label.requirements2', [data.data.requirements])}/>
			<ActionLogItemDetail name="requirements type" type="with" value={data.data.requirements_type} tv="mellow_sync_action.requirements_type.%"/>
		{:else if data.type === 'mellow.server.syncing.action.updated'}
			<ActionLogItemDetail type="rename" change={data.data.name}/>
			<ActionLogItemDetail name="type" change={data.data.type}/>
			<ActionLogItemDetail name="metadata" change={data.data.data}/>
			<ActionLogItemDetail name="requirements" change={data.data.requirements}/>
			<ActionLogItemDetail name="requirements type" change={data.data.requirements_type} tv="mellow_sync_action.type.%"/>
		{:else if data.type === 'mellow.server.syncing.settings.updated'}
			<ActionLogItemDetail name="default nickname" change={data.data.default_nickname}/>
			<ActionLogItemDetail name="forceful syncing" change={data.data.allow_forced_syncing}/>
		{:else if data.type === 'mellow.server.discord_logging.updated'}
			<ActionLogItemDetail name="target channel" change={data.data.channel}/>
		{:else if data.type === 'team.role.updated'}
			<ActionLogItemDetail type="rename" change={data.data.name}/>
			<ActionLogItemDetail name="position" change={data.data.position}/>
			<ActionLogItemDetail name="permissions" change={data.data.permissions}/>
		{/if}
	{/if}
</div>

<style lang="scss">
	.action-log-item {
		width: 100%;
		.header {
			display: flex;
			align-items: center;
			.text {
				color: var(--color-secondary);
				margin: 0 0 0 16px;
				font-size: .9em;
			}
			.created {
				color: var(--color-secondary);
				margin: 0 0 0 auto;
				font-size: .8em;
			}
		}
	}
</style>