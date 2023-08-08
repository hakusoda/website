<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';

	import Newspaper from '$lib/icons/Newspaper.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: LayoutData;

	$: base = `/team/${$page.params.name}/settings`;
</script>

<div class="main">
	<div class="nav">
		<div class="team">
			<Avatar src={data.avatar_url} size="sm" transparent/>
			<div class="name">
				<h1>{data.display_name}</h1>
				<p>@{data.name}</p>
			</div>
		</div>
		
		<SettingsNavItem id="team.settings.profile" path={`${base}/profile`}>
			<PersonFill/>
		</SettingsNavItem>

		<p>{$t('team.settings.access')}</p>
		<SettingsNavItem id="team.settings.access.members" path={`${base}/access/members`}>
			<PeopleFill/>
		</SettingsNavItem>
		<SettingsNavItem id="team.settings.access.roles" path={`${base}/access/roles`}>
			<PeopleFill/>
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
		.team {
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