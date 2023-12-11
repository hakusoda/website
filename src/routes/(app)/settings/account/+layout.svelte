<script lang="ts">
	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import GearFill from '$lib/icons/GearFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import ShieldLockFill from '$lib/icons/ShieldLockFill.svelte';
</script>

<WithSideNavigation items={[
	['/settings/account', GearFill],
	['/settings/account/connections', PersonFill],
	['/settings/account/security', ShieldLockFill]
]}>
	<slot/>
</WithSideNavigation>