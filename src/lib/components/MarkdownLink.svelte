<script lang="ts">
	export let href = '';
	export let title: string | null = null;
</script>

<a {href} {title} target="_blank">
	<slot/>
</a>