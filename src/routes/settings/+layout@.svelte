<script lang="ts">
	import { t } from '$lib/localisation';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SideNavigation from '$lib/layouts/SideNavigation.svelte';
	import SideNavigationItem from '$lib/components/SideNavigationItem.svelte';

	import Discord from '$lib/icons/Discord.svelte';
	import GridFill from '$lib/icons/GridFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
	import ShieldLockFill from '$lib/icons/ShieldLockFill.svelte';
	export let data: LayoutData;
</script>

<SideNavigation>
	<svelte:fragment slot="nav">
		<div class="user">
			<Avatar id={data.session?.sub} src={data.user?.avatar_url} size="sm" circle transparent/>
			<div class="name">
				<h1>{data.user?.name ?? data.user?.username}</h1>
				<p>@{data.user?.username}</p>
			</div>
		</div>

		<SideNavigationItem id="settings.account" path="/settings/account">
			<PersonFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.account.connections" path="/settings/account/connections">
			<PersonFill/>
		</SideNavigationItem>

		<p>{$t('settings.access')}</p>
		<SideNavigationItem id="settings.access.teams" path="/settings/access/teams">
			<PeopleFill/>
		</SideNavigationItem>
		<SideNavigationItem id="settings.access.security" path="/settings/access/security">
			<ShieldLockFill/>
		</SideNavigationItem>
	
		<p>{$t('settings.roblox')}</p>
		<SideNavigationItem id="settings.roblox.accounts" path="/settings/roblox/accounts">
			<RobloxIcon/>
		</SideNavigationItem>

		<p>{$t('settings.mellow')}</p>
		<SideNavigationItem id="settings.mellow.servers" path="/settings/mellow/servers">
			<Discord/>
		</SideNavigationItem>

		<p>{$t('settings.integrations')}</p>
		<SideNavigationItem id="settings.integrations.applications" path="/settings/integrations/applications">
			<GridFill/>
		</SideNavigationItem>
	</svelte:fragment>
	<slot/>
</SideNavigation>

<style lang="scss">
	.user {
		margin: 16px;
		display: flex;
		align-items: center;
		.name {
			margin-left: 16px;
			h1 {
				margin: 0;
				font-size: 1em;
				font-weight: 500;
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: .9em;
			}
		}
	}
</style>