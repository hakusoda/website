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
	article {
		font-weight: 400;
		padding-bottom: 64px;
	}
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
	article :global(h2) {
		margin-top: 64px;
		font-weight: 600;
	}
	article :global(h6) {
		color: var(--color-secondary);
		margin: 0;
		font-size: 12px;
		font-style: italic;
		font-weight: 400;
	}
	article:has(p.summary) > :global(*:nth-child(3)) {
		margin-top: 64px;
	}
	article :global(p:not(.summary)) {
		line-height: normal;
	}
	article :global(code) {
		color: #ffffff90;
		padding: 3px 7px;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-secondary);
		border-radius: 6px;
	}
	article :global(ol) {
		gap: 16px;
		display: flex;
		flex-direction: column;
	}
	article :global(img) {
		max-width: 100%;
	}
</style>