<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';

	import Link from '$lib/icons/Link.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import ArrowLeft from '$lib/icons/ArrowLeft.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import DiamondFill from '$lib/icons/DiamondFill.svelte';
	export let data: LayoutData;

	$: base = `/mellow/server/${$page.params.id}/settings`;
</script>

<div class="main">
	<div class="nav">
		<div class="server">
			<Avatar src={data.avatar_url} size="sm" transparent/>
			<h1>{data.name}</h1>
		</div>

		<SettingsNavItem id="mellow.server.settings.commands.custom" path={`${base}/commands/custom`}>
			<DiamondFill/>
		</SettingsNavItem>
		<SettingsNavItem id="mellow.server.settings.logging" path={`${base}/logging`}>
			<Newspaper/>
		</SettingsNavItem>

		<p>{$t('mellow.server.settings.access')}</p>
		<SettingsNavItem id="mellow.server.settings.access.members" path={`${base}/access/members`}>
			<PersonFill/>
		</SettingsNavItem>

		<p>{$t('mellow.server.settings.roblox')}</p>
		<SettingsNavItem id="mellow.server.settings.roblox.global" path={`${base}/roblox/global`}>
			<GearFill/>
		</SettingsNavItem>
		<SettingsNavItem id="mellow.server.settings.roblox.binds" path={`${base}/roblox/binds`}>
			<Link/>
		</SettingsNavItem>

		<p>{$t('team.settings.archive')}</p>
		<SettingsNavItem id="mellow.server.settings.audit_log" path={`${base}/archive/audit-log`}>
			<Newspaper/>
		</SettingsNavItem>

		<SettingsNavItem id="mellow.server.settings.return" path="/settings/mellow/servers" footer>
			<ArrowLeft/>
		</SettingsNavItem>
	</div>
	<slot/>
</div>

<style lang="scss">
	.main {
		display: flex;
		min-height: 100%;
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

		.nav {
			width: 25%;
			margin: 16px 0 16px 16px;
			display: flex;
			min-width: 25%;
			flex-direction: column;
			p {
				color: var(--color-secondary);
				margin: 32px 16px 8px;
				font-size: .8em;
			}
		}
	}
</style>