<script>
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	export let title;
	export let summary;

	$: base = $page.url.pathname.split('/')[1];
</script>

<h1>
	{title || $t(`${base}.articles.${$page.url.pathname.replace(/^\/\w+\/?/, '').replace('/', '.')}`)}
</h1>
{#if summary}
	<p>{summary}</p>
{/if}
<slot/>

<style lang="scss">
	h1 {
		font-size: 2.5em;
		font-weight: 600;
	}
	p {
		color: var(--color-secondary);
		font-size: 1.1em;
	}
</style>