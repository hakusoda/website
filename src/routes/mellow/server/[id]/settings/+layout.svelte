<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';
	import type { LayoutData } from './$types';

	import Link from '$lib/icons/Link.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import ArrowLeft from '$lib/icons/ArrowLeft.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';
	import DiamondFill from '$lib/icons/DiamondFill.svelte';
	export let data: LayoutData;

	$: base = `/mellow/server/${$page.params.id}/settings`;
</script>

<div class="main">
	<div class="nav">
		<p>{data.name}</p>
		<SettingsNavItem id="mellow.server.settings.commands.custom" path={`${base}/commands/custom`}>
			<DiamondFill/>
		</SettingsNavItem>
		<SettingsNavItem id="mellow.server.settings.logging" path={`${base}/logging`}>
			<Newspaper/>
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