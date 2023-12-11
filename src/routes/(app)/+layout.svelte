<script lang="ts">
	import type { LayoutData } from './$types';

	import AppLayout from '$lib/layouts/AppLayout.svelte';
	export let data: LayoutData;
</script>

<AppLayout {...data}>
	<slot/>
</AppLayout>