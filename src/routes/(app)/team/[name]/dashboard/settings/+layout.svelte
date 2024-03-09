<script lang="ts">
	import { page } from '$app/stores';

	import WithSideNavigation from '$lib/ui/layouts/WithSideNavigation.svelte';

	import GearFill from 'virtual:icons/bi/gear-fill';
	import GridFill from 'virtual:icons/bi/grid-fill';
	import Newspaper from 'virtual:icons/bi/newspaper';

	$: base = `/team/${$page.params.name}/dashboard/settings`;
</script>

<WithSideNavigation items={[
	[base, GearFill, 'side_navigation.settings.account'],
	[`${base}/applications`, GridFill, 'side_navigation.team_settings.applications'],
	[`${base}/action-log`, Newspaper, 'side_navigation.team_settings.action_log']
]}>
	<slot/>
</WithSideNavigation>