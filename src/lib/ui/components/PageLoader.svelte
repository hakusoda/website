<script lang="ts">
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { navigating } from '$app/stores';

	const progress = tweened(0, { easing: cubicOut, duration: 3500 });
	onMount(() => navigating.subscribe(state => {
		if (!state) {
			progress.set(1.5, { duration: 1000 });
			setTimeout(() => progress.set(0, { duration: 0 }), 1000);
		} else
			progress.set(0.5);
	}));
</script>


<div class="bar">
	<div class="progress" style={`width: ${Math.min($progress, 1) * 100}%; opacity: ${1 - Math.max($progress - 1, 0) * 2};`} />
</div>

<style lang="scss">
	.bar {
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		z-index: 1000;
		position: fixed;
		.progress {
			height: 100%;
			background: var(--button-background);
		}
	}
</style>