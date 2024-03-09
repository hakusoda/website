<script lang="ts">
	import Markdown from 'svelte-markdown';

	import './Markdown.scss';
	import MarkdownLink from './MarkdownLink.svelte';
	import MarkdownImage from './MarkdownImage.svelte';
	export let source: string;
	export let inline = false;
</script>

<div class="markdown">
	<Markdown {source} isInline={inline} renderers={{ link: MarkdownLink, image: MarkdownImage }}/>
</div>