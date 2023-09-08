<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SideNavigation from '$lib/layouts/SideNavigation.svelte';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';

	import Link from '$lib/icons/Link.svelte';
	import Webhook from '$lib/icons/Webhook.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import ArrowLeft from '$lib/icons/ArrowLeft.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import HouseDoorFill from '$lib/icons/HouseDoorFill.svelte';
	export let data: LayoutData;

	$: base = `/mellow/server/${$page.params.id}/settings`;
</script>

<SideNavigation>
	<svelte:fragment slot="nav">
		<div class="server">
			<Avatar src={data.avatar_url} size="sm" transparent/>
			<h1>{data.name}</h1>
		</div>

		<SettingsNavItem id="mellow.server.settings.home" path={base}>
			<HouseDoorFill/>
		</SettingsNavItem>

		<p>{$t('mellow.server.settings.access')}</p>
		<SettingsNavItem id="mellow.server.settings.access.members" path={`${base}/access/members`}>
			<PersonFill/>
		</SettingsNavItem>

		<p>{$t('mellow.server.settings.automation')}</p>
		<SettingsNavItem id="mellow.server.settings.automation.webhooks" path={`${base}/automation/webhooks`}>
			<Webhook/>
		</SettingsNavItem>

		<p>{$t('mellow.server.settings.syncing')}</p>
		<SettingsNavItem id="mellow.server.settings.syncing.actions" path={`${base}/syncing/actions`}>
			<Link/>
		</SettingsNavItem>
		<SettingsNavItem id="mellow.server.settings.syncing.settings" path={`${base}/syncing/settings`}>
			<GearFill/>
		</SettingsNavItem>

		<p>{$t('team.settings.archive')}</p>
		<SettingsNavItem id="mellow.server.settings.audit_log" path={`${base}/archive/audit-log`}>
			<Newspaper/>
		</SettingsNavItem>
		<SettingsNavItem id="mellow.server.settings.logging" path={`${base}/logging`}>
			<Newspaper/>
		</SettingsNavItem>

		<SettingsNavItem id="mellow.server.settings.return" path="/settings/mellow/servers" footer>
			<ArrowLeft/>
		</SettingsNavItem>
	</svelte:fragment>
	<slot/>
</SideNavigation>

<style lang="scss">
	.server {
		margin: 16px;
		display: flex;
		align-items: center;
		h1 {
			margin: 0 0 0 16px;
			font-size: 1em;
			font-weight: 500;
		}
	}
</style>