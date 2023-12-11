<script lang="ts">
	import { Tabs } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import TeamSettingsMember from '$lib/components/TeamSettingsMember.svelte';
	export let data: PageData;

	let tab = 0;

	$: myRole = data.members.find(member => member.user.id === data.user?.id)?.role;
</script>

<div class="geist">
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
					<TeamSettingsMember
						id={item.user.id}
						name={item.user.name}
						teamId={data.id}
						avatar={item.user.avatar_url}
						inviter={item.author}
						isInvite
						joinedAt={item.created_at}
						username={item.user.username}
					/>
				{/each}
			</div>
		</Tabs.Item>
	</Tabs.Root>
	<p class="tip">{$t('team.settings.access.members.invites.tip')}</p>
</div>

<style lang="scss">
	.geist {
		margin-top: 32px;
	}
	.members {
		gap: 16px;
		display: flex;
		flex-direction: column;
	}
	.tip {
		color: var(--color-secondary);
		font-size: .9em;
		margin-top: 32px;
	}
</style>