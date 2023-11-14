<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SideNavigation from '$lib/layouts/SideNavigation.svelte';
	import SideNavigationItem from '$lib/components/SideNavigationItem.svelte';

	import Link from '$lib/icons/Link.svelte';
	import Webhook from '$lib/icons/Webhook.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import ArrowLeft from '$lib/icons/ArrowLeft.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';
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

		<SideNavigationItem id="mellow.server.settings.home" path={base}>
			<HouseDoorFill/>
		</SideNavigationItem>

		<p>{$t('mellow.server.settings.automation')}</p>
		<SideNavigationItem id="mellow.server.settings.automation.logging" path={`${base}/automation/logging`}>
			<Newspaper/>
		</SideNavigationItem>
		<SideNavigationItem id="mellow.server.settings.automation.webhooks" path={`${base}/automation/webhooks`}>
			<Webhook/>
		</SideNavigationItem>

		<p>{$t('mellow.server.settings.syncing')}</p>
		<SideNavigationItem id="mellow.server.settings.syncing.actions" path={`${base}/syncing/actions`}>
			<Link/>
		</SideNavigationItem>
		<SideNavigationItem id="mellow.server.settings.syncing.settings" path={`${base}/syncing/settings`}>
			<GearFill/>
		</SideNavigationItem>

		<p>{$t('team.settings.archive')}</p>
		<SideNavigationItem id="mellow.server.settings.audit_log" path={`${base}/archive/audit-log`}>
			<Newspaper/>
		</SideNavigationItem>

		<SideNavigationItem id="mellow.server.settings.return" path="/settings/mellow/servers" footer>
			<ArrowLeft/>
		</SideNavigationItem>
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