<script lang="ts">
	import type { LayoutData } from './$types';

	import AppLayout from '$lib/layouts/AppLayout.svelte';

	import GearFill from '$lib/icons/GearFill.svelte';
	import MellowFace from '$lib/icons/MellowFace.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: LayoutData;
</script>

<AppLayout navigation={[
	['/settings/profile', PersonFill],
	['/settings/teams', PeopleFill],
	['/settings/mellow/servers', MellowFace],
	['/settings/account', GearFill]
]} {...data}>
	<slot/>
</AppLayout>