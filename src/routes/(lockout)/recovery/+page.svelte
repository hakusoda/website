<script lang="ts">
	import { onMount } from 'svelte';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { recoverAccountViaLink } from '$lib/api';

	import Loader from '$lib/components/Loader.svelte';

	$: hash = $page.url.hash.slice(1);
	onMount(async () => {
		if (hash) {
			const response = await recoverAccountViaLink(hash);
			if (response.success)
				goto('/settings/account/security?recovered');
		}
	});
</script>

<div>
	{#if hash || !browser}
		<Loader/>
	{:else}
		{$t('request_error.0')}
	{/if}
</div>

<style>
	div {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>