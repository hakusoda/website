<script lang="ts">
	import AppLayout from '$lib/ui/layouts/AppLayout.svelte';

	import GearFill from 'virtual:icons/bi/gear-fill';
	import MellowFace from '$lib/ui/icons/MellowFace.svelte';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	import PersonFill from 'virtual:icons/bi/person-fill';
</script>

<AppLayout navigation={[
	['/settings/profile', PersonFill],
	['/settings/teams', PeopleFill],
	['/mellow/dashboard', MellowFace, 'navigation.settings.mellow'],
	['/settings/account', GearFill, 'navigation.generic.settings']
]}>
	<slot/>
</AppLayout>