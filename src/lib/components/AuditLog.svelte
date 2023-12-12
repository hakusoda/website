<script lang="ts">
	import { t } from '../localisation';
	import { page } from '$app/stores';
	import type { MellowServerAuditLogType } from '$lib/types';

	import Link from '../icons/Link.svelte';
	import Avatar from './Avatar.svelte';
	import ActionLogItemDetail from './ActionLogItemDetail.svelte';

	export let data: any;
	export let text: string;
	export let type: MellowServerAuditLogType;
	export let author: {
		id: string
		name: string | null
		username: string
		avatar_url: string | null
	};
	export let created_at: string;
	export let target_user: { name: string | null, username: string } | null = null;
	export let target_action: { name: string } | null = null;
</script>

<div class="audit-log">
	<div class="header">
		<Avatar src={author.avatar_url} size="xs" circle/>
		<p class="text">
			{#if $page.data.session?.sub === author.id}
				<b>{$t('label.you_monster')}</b>
			{:else}
				<a href={`/user/${author.username}`}>
					{author.name ?? `@${author.username}`}
				</a>
			{/if}
			{#each text.split(' ') as item}
				{#if item === '{user}'}
					{#if target_user}
						<a href={`/user/${target_user.username}`}>
							{target_user.name ?? `@${target_user.username}`}</a>&nbsp
					{:else}
						<b>Unknown user</b>
					{/if}
				{:else if item === '{mellow_sync_action}'}
					<b class:deleted={!target_action && !!data?.name}><Link/>{#if target_action}{target_action.name}{:else if data?.name}{data.name}{:else}Unknown mellow action{/if}</b>
				{:else}
					{item}&nbsp
				{/if}
			{/each}
		</p>
		<p class="created">{$t('time_ago', [created_at])}</p>
	</div>
	{#if data}
		{#if type === 'mellow.server.syncing.action.created'}
			<ActionLogItemDetail name="name" type="with" value={data.name}/>
			<ActionLogItemDetail name="type" type="with" value={data.type} tv="mellow_sync_action.type.%"/>
			<ActionLogItemDetail type="with2" value={$t('label.requirements2', [data.requirements])}/>
			<ActionLogItemDetail name="requirements type" type="with" value={data.requirements_type} tv="mellow_sync_action.requirements_type.%"/>
		{:else if type === 'mellow.server.syncing.action.updated'}
			<ActionLogItemDetail type="rename" change={data.name}/>
			<ActionLogItemDetail name="type" change={data.type}/>
			<ActionLogItemDetail name="metadata" change={data.data}/>
			<ActionLogItemDetail name="requirements" change={data.requirements}/>
			<ActionLogItemDetail name="requirements type" change={data.requirements_type} tv="mellow_sync_action.type.%"/>
		{:else if type === 'mellow.server.syncing.settings.updated'}
			<ActionLogItemDetail name="default nickname" change={data.default_nickname}/>
			<ActionLogItemDetail name="forceful syncing" change={data.allow_forced_syncing}/>
		{:else if type === 'mellow.server.discord_logging.updated'}
			<ActionLogItemDetail name="target channel" change={data.channel}/>
		{/if}
	{/if}
</div>

<style lang="scss">
	.audit-log {
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
		:global(b) {
			color: var(--color-primary);
			font-weight: normal;
			:global(svg) {
				margin: 0 4px -2px;
			}
			&.deleted {
				color: #e06c6c;
			}
		}
	}
</style>