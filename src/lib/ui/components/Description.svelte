<script lang="ts">
	export let value: string | undefined | null = null;
	$: processed = value ?
		value.replace(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/g, url => {
			return `<a href="${url}" target="_blank">${url}</a>`;
		}).replace(/\*\*.*?\*\*/g, match => `<strong>${match.slice(2, -2)}</strong>`)
	: null;
</script>

<p class="description">
	{#if processed}
		{@html processed}
	{/if}
	<slot/>
</p>

<style lang="scss">
	p.description {
		color: var(--color-tertiary);
		margin: 0;
		overflow: hidden;
		word-break: break-word;
		line-height: 1.25;
		white-space: pre-line;
	}
</style>