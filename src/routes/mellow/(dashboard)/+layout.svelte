<script lang="ts">
	import AppLayout from '$lib/ui/layouts/AppLayout.svelte';

	import ListUl from 'virtual:icons/bi/list-ul';
	import GearFill from 'virtual:icons/bi/gear-fill';
	import MellowIcon from '$lib/ui/icons/MellowIcon.svelte';
	import HouseDoorFill from 'virtual:icons/bi/house-door-fill';
</script>

<AppLayout
	navigation={[
		['/mellow/dashboard', HouseDoorFill, 'navigation.mellow.dashboard'],
		['/mellow/servers', ListUl, 'navigation.mellow.dashboard.servers'],
		['/mellow/settings', GearFill, 'navigation.generic.settings']
	]}
	disableDefaultBrand
	disableDefaultTopNav
>
	<MellowIcon size={32} slot="header-top"/>
	<slot/>
</AppLayout>