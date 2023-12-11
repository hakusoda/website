<script lang="ts">
	import { page } from '$app/stores';

	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import GearFill from '$lib/icons/GearFill.svelte';
	import GridFill from '$lib/icons/GridFill.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';

	$: base = `/team/${$page.params.name}/dashboard/settings`;
</script>

<WithSideNavigation items={[
	[base, GearFill, 'side_navigation.settings.account'],
	[`${base}/applications`, GridFill, 'side_navigation.team_settings.applications'],
	[`${base}/action-log`, Newspaper, 'side_navigation.team_settings.action_log']
]}>
	<slot/>
</WithSideNavigation>