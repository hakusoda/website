<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/util';
	import { TeamRolePermission } from '$lib/enums';

	import Avatar from '$lib/components/Avatar.svelte';
	import AppLayout from '$lib/layouts/AppLayout.svelte';

	import GearFill from 'virtual:icons/bi/gear-fill';
	import ChevronUp from 'virtual:icons/bi/chevron-up';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	import PersonFill from 'virtual:icons/bi/person-fill';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	export let data;

	$: base = `/team/${$page.params.name}/dashboard`;

	let trigger: () => void;
</script>

<AppLayout navigation={[
	[`${base}/profile`, PersonFill, 'navigation.settings.profile'],
	[`${base}/members`, PeopleFill, 'navigation.team_settings.members'],
	[`${base}/roles`, PeopleFill, 'navigation.team_settings.roles'],
	[`${base}/settings`, GearFill, 'navigation.settings.account']
]} disableDefaultTopNav>
	<svelte:fragment slot="header-top-nav">
		<button class="context-selector" type="button" on:click={trigger}>
			<Avatar id={$page.params.id} src={data.avatar_url} size="xxs"/>
			{data.display_name ?? data.name}
			<div class="arrows">
				<ChevronUp font-size={12}/>
				<ChevronDown font-size={12}/>
			</div>
		</button>
	</svelte:fragment>
	<slot/>
</AppLayout>

<ContextMenu.Root bind:trigger>
	<p>{$t('user_action.user.teams')}</p>
	{#if data.user}
		{#each data.user.teams
			.filter(i => i.team.owner_id === data.session?.sub || (i.role && (hasBit(i.role.permissions, TeamRolePermission.ManageTeam) || hasBit(i.role.permissions, TeamRolePermission.Administrator))))
			.map(i => i.team)
			.sort((a, b) => (a.display_name ?? a.name).localeCompare(b.display_name ?? b.name))
		as team}
			<a href={`/team/${team.name}/dashboard/${$page.url.pathname.match(/team\/.+?\/dashboard\/(.*)/)?.[1] ?? ''}`}>
				<Avatar id={team.id} src={team.avatar_url} size="xxs"/>
				{team.display_name ?? team.name}
			</a>
		{/each}
	{/if}
</ContextMenu.Root>