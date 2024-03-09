<script>
	export let href = '';
	export let text = '';
	export let title = undefined;
</script>

<a class="image" {href} target="_blank"><img src={href} {title} alt={text}></a>

<style lang="scss">
	.image {
		img {
			filter: drop-shadow(0 4px 8px #00000040);
			transition: transform .25s;
		}
	}
</style>