<script lang="ts">
	import './ActionLogItem.scss';
	import { t } from '../localisation';
	import { page } from '$app/stores';
	import type { ActionLogItem } from '$lib/shared/types';
	import { get_data_change_value } from '$lib/client/util';

	import Avatar from './Avatar.svelte';
	import ActionLogItemDetail from './ActionLogItemDetail.svelte';

	import Link from 'virtual:icons/bi/link-45deg';
	import Command from '../icons/Command.svelte';
	import Webhook from '../icons/Webhook.svelte';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data: ActionLogItem;

	$: text = $t(`action_log.type.${data.type}`, [data]);
	$: target_name = get_data_change_value(data.data_changes.find(item => item.name === 'name' || item.name === 'display_name'));
</script>

<div class="action-log-item">
	<div class="header">
		<Avatar src={data.author ? data.author.avatar_url : '/apple-touch-icon.png'} size="xs" circle/>
		<p class="text">
			{#if $page.data.session?.sub === data.author?.id}
				<b>{$t('label.you_monster')}</b>
			{:else if data.author}
				<a href={`/user/${data.author.username}`}>
					{data.author.name ?? `@${data.author.username}`}
				</a>
			{:else}
				<b>HAKUMI</b>
			{/if}
			{#each text.split(' ') as item}
				{#if item === '{user}'}
					{@const target = data.target_user}
					{#if target}
						<a href={`/user/${target.username}`}>
							{target.name ?? `@${target.username}`}</a>&nbsp
					{:else}
						<b class="deleted">{$t('action_log.unknown_user')}</b>
					{/if}
				{:else if item === '{mellow_sync_action}'}
					{@const target = data.target_sync_action}
					<b class:deleted={!target}>
						<Link/>{#if target}{target.display_name}{:else}{target_name ?? $t('action_log.unknown_mellow_action')}{/if}
					</b>
				{:else if item === '{mellow_command}'}
					{@const target = data.target_command}
					{#if target}
						<a href={`/mellow/server/${$page.params.id}/commands/${target.id}`}>
							<Command/>{target.name}
						</a>
					{:else}
						<b class="deleted">
							<Command/>{target_name ?? $t('action_log.unknown_command')}
						</b>
					{/if}
				{:else if item === '{mellow_webhook}'}
					{@const target = data.target_webhook}
					{#if target}
						<a href={`/mellow/server/${$page.params.id}/settings/webhooks/${target.id}`}>
							<Webhook/>{target.name}
						</a>
					{:else}
						<b class="deleted">
							<Webhook/>{target_name ?? $t('action_log.unknown_webhook')}
						</b>
					{/if}
				{:else if item === '{team_role}'}
					{@const target = data.target_team_role}
					{#if target}
						<a href={`/team/${$page.params.name}/dashboard/roles/${target.id}`}>
							<PeopleFill/>{target.name}
						</a>
					{:else}
						<b class="deleted">
							<PeopleFill/>{target_name ?? $t('action_log.unknown_team_role')}
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
	{#each data.data_changes as item}
		{@const { name, kind } = item}
		{@const tv = name === 'kind' && data.type.startsWith('mellow.server.syncing.action.') ? 'mellow_sync_action.kind.%' : null}
		{#if kind === 'created'}
			<ActionLogItemDetail {name} type="with" value={item.value} {tv}/>
		{:else if kind === 'updated'}
			<ActionLogItemDetail {name} change={[item.old_value, item.new_value]} {tv}/>
		{:else}
			<ActionLogItemDetail {name} type="with" value={item.old_value} {tv}/>
		{/if}
	{/each}
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