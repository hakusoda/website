<script lang="ts">
	import { Tabs } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import TeamSettingsMember from '$lib/components/TeamSettingsMember.svelte';
	export let data: PageData;

	let tab = 0;

	$: myRole = data.members.find(member => member.user.id === data.user?.id)?.role;
</script>

<div class="main">
	<Tabs.Root bind:value={tab}>
		<Tabs.Item title={$t('team.settings.access.members.tab', [data.members.length])} value={0}>
			<div class="members">
				{#each data.members as item}
					<TeamSettingsMember
						id={item.user.id}
						role={item.role}
						name={item.user.name}
						roles={data.roles}
						owner={data.owner_id}
						avatar={item.user.avatar_url}
						teamId={data.id}
						inviter={item.inviter}
						joinedAt={item.joined_at}
						username={item.user.username}
						{myRole}
					/>
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
		}
		.tip {
			color: var(--color-secondary);
			font-size: .9em;
			margin-top: 32px;
		}
	}
</style>