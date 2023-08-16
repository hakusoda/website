<script lang="ts">
	import { Tabs } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	export let data: PageData;

	let tab = 0;
</script>

<div class="main">
	<Tabs.Root bind:value={tab}>
		<Tabs.Item title={$t('team.settings.access.members.tab', [data.members.length])} value={0}>
			<div class="members">
				{#each data.members as item}
					<div class="item">
						<Avatar id={item.user.id} src={item.user.avatar_url} size="sm" circle/>
						<div class="details">
							<a href={`/user/${item.user.username}`}>
								{item.user.name || item.user.username}
								<p>@{item.user.username}</p>
							</a>
							<p>
								{#if item.role}
									{item.role.name} •
								{/if}{$t('profile.joined', [item.joined_at])}{#if item.inviter}
									, {$t('team_invite.author2')}
									<a href={`/user/${item.inviter.username}`}>
										{item.inviter.name || item.inviter.username}
									</a>
								{/if}
							</p>
						</div>
					</div>
				{/each}
			</div>
		</Tabs.Item>
		<Tabs.Item title={$t('team.settings.access.members.invites', [data.invites.length])} value={1}>
			<div class="members">
				{#each data.invites as item}
					<div class="item">
						<Avatar id={item.user.id} src={item.user.avatar_url} size="sm" circle/>
						<div class="details">
							<a href={`/user/${item.user.username}`}>
								{item.user.name || item.user.username}
								<p>@{item.user.username}</p>
							</a>
							{#if item.author}
								<p>
									{$t('team_invite.author')}
									<a href={`/user/${item.author.username}`}>
										{item.author.name || item.author.username}
									</a>
									{$t('time_ago', [item.created_at])}
								</p>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</Tabs.Item>
	</Tabs.Root>
	<p class="tip">{$t('team.settings.access.members.invites.tip')}</p>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 64px;
		.members {
			gap: 8px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				padding: 12px 16px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.details {
					margin-left: 16px;
					& > a {
						gap: 8px;
						margin: 0;
						display: flex;
						line-height: 1;
						font-weight: 500;
						align-items: center;
						p { margin: 0; }
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
						font-weight: 400;
					}
				}
			}
		}
		.tip {
			color: var(--color-secondary);
			font-size: .9em;
			margin-top: 32px;
		}
	}
</style>