<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';
	import type { LayoutData } from './$types';

	import Newspaper from '$lib/icons/Newspaper.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: LayoutData;

	$: base = `/team/${$page.params.name}/settings`;
</script>

<div class="main">
	<div class="nav">
		<p>{data.display_name}</p>
		<SettingsNavItem id="team.settings.profile" path={`${base}/profile`}>
			<PersonFill/>
		</SettingsNavItem>

		<p>{$t('team.settings.archive')}</p>
		<SettingsNavItem id="team.settings.archive.audit_log" path={`${base}/archive/audit-log`}>
			<Newspaper/>
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