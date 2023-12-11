<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';

	import AppLayout from '$lib/layouts/AppLayout.svelte';

	import GearFill from '$lib/icons/GearFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: LayoutData;

	$: base = `/team/${$page.params.name}/dashboard`;
</script>

<AppLayout navigation={[
	[`${base}/profile`, PersonFill, 'navigation.settings.profile'],
	[`${base}/members`, PeopleFill, 'navigation.team_settings.members'],
	[`${base}/roles`, PeopleFill, 'navigation.team_settings.roles'],
	[`${base}/settings`, GearFill, 'navigation.settings.account']
]} {...data}>
	<slot/>
</AppLayout>