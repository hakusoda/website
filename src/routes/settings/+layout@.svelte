<script lang="ts">
	import { t } from '$lib/localisation';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SideNavigation from '$lib/layouts/SideNavigation.svelte';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';

	import Discord from '$lib/icons/Discord.svelte';
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

		<SettingsNavItem id="settings.account" path="/settings/account">
			<PersonFill/>
		</SettingsNavItem>
		<SettingsNavItem id="settings.account.connections" path="/settings/account/connections">
			<PersonFill/>
		</SettingsNavItem>

		<p>{$t('settings.access')}</p>
		<SettingsNavItem id="settings.access.teams" path="/settings/access/teams">
			<PeopleFill/>
		</SettingsNavItem>
		<SettingsNavItem id="settings.access.security" path="/settings/access/security">
			<ShieldLockFill/>
		</SettingsNavItem>
	
		<p>{$t('settings.roblox')}</p>
		<SettingsNavItem id="settings.roblox.accounts" path="/settings/roblox/accounts">
			<RobloxIcon/>
		</SettingsNavItem>

		<p>{$t('settings.mellow')}</p>
		<SettingsNavItem id="settings.mellow.servers" path="/settings/mellow/servers">
			<Discord/>
		</SettingsNavItem>
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