<script lang="ts">
	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import GearFill from 'virtual:icons/bi/gear-fill';
	import PersonFill from 'virtual:icons/bi/person-fill';
	import ShieldLockFill from 'virtual:icons/bi/shield-lock-fill';
</script>

<WithSideNavigation items={[
	['/settings/account', GearFill],
	['/settings/account/connections', PersonFill],
	['/settings/account/security', ShieldLockFill]
]}>
	<slot/>
</WithSideNavigation>