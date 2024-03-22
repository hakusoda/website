<script lang="ts">
	import { get } from 'svelte/store';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	onMount(() => window.opener.postMessage(JSON.parse(decodeURIComponent(get(page).url.hash.substring(1)))));
</script>