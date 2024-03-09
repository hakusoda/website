<script>
	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	export let title;
	export let summary;

	$: base = $page.url.pathname.split('/')[1];
</script>

<article>
	<h1>
		{title || $t(`${base}.articles.${$page.url.pathname.replace(/^\/\w+\/?/, '').replace(/\//g, '.')}`)}
	</h1>
	{#if summary}
		<p class="summary">{summary}</p>
	{/if}
	<slot/>
</article>

<style>
	article h1 {
		font-size: 2.5em;
		font-weight: 600;
	}
	article p.summary {
		color: var(--color-secondary);
		font-size: 1.1em;
	}
	article :global(a) {
		color: var(--color-link);
	}
	article :global(p:not(.summary)) {
		line-height: normal;
	}
</style>