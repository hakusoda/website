<script lang="ts">
	import './PageSlider.scss';
	import { onMount } from 'svelte';
	export let position = 0;

	let last = 0;
	let elements: HTMLElement[];
	let prev_size = [0, 0];
	let target_size = [0, 0];
	let root_element: HTMLDivElement;
	let current_position = position;
	let previous_position = position;
	function lerp(a: number, b: number, alpha: number) {
		return a + alpha * ( b - a );
	}

	const animate = (timestamp: DOMHighResTimeStamp) => {
		timestamp /= 1000;
		if (!last)
			last = timestamp;

		const delta_time = (timestamp - last) * 1.5;
		if (current_position < position)
			current_position = Math.min(current_position + delta_time, position);
		else if (current_position > position)
			current_position = Math.max(current_position - delta_time, position);

		let alpha = Math.abs(current_position - previous_position) * 2;
		if (alpha < 1)
			alpha = 0.5 * (alpha * alpha);
		else {
			alpha = 2 - alpha;
			alpha = 0.5 * (1 - (alpha * alpha)) + 0.5;
		}

		for (const [index, element] of elements.entries()) {
			element.style.top = '0';
			if (index === position) {
				if (previous_position < position)
					element.style.right = `${target_size[0] * (-1 + alpha)}px`;
				else
					element.style.left = `${target_size[0] * (-1 + alpha)}px`;
			} else if (index < position) {
				element.style.left = `${-prev_size[0] * alpha}px`;
			} else {
				element.style.right = `${-prev_size[0] * alpha}px`;
			}
			element.style.position = 'absolute';
		}
		if (position !== current_position) {
			root_element.style.width = `${lerp(prev_size[0], target_size[0], alpha)}px`;
			root_element.style.height = `${lerp(prev_size[1], target_size[1], alpha)}px`;

			requestAnimationFrame(animate);
		} else {
			const element = elements[position];
			if (element)
				element.style.removeProperty('position');
			root_element.style.removeProperty('width');
			root_element.style.removeProperty('height');
			for (const [index, element] of elements.entries()) {
				element.style.removeProperty('width');
				element.style.removeProperty('height');
				if (index !== position)
					element.style.visibility = 'hidden';
			}
			last = 0;
			previous_position = position;
		}

		last = timestamp;
	};

	let last_position = position;
	$: if (position !== last_position) {
		const prev_element = elements[last_position];
		if (prev_element) {
			const b = prev_element.getBoundingClientRect();
			prev_element.style.position = 'absolute';

			const target_element = elements[position];
			if (target_element) {
				target_element.style.removeProperty('position');

				const b = target_element.getBoundingClientRect();
				target_size = [b.width, b.height];

				target_element.style.width = `${b.width}px`;
				//target_element.style.height = `${b.height}px`;
				target_element.style.position = 'absolute';
			}
			if (b.width) {
				prev_size = [b.width, b.height];
				prev_element.style.width = `${b.width}px`;
				prev_element.style.height = `${b.height}px`;
				root_element.style.width = `${b.width}px`;
				root_element.style.height = `${b.height}px`;
			} else {
				root_element.style.removeProperty('width');
				root_element.style.removeProperty('height');
			}
		}

		last = 0;
		requestAnimationFrame(timestamp => {
			const target_element = elements[position];
			if (target_element) {
				target_element.style.removeProperty('position');

				const b = target_element.getBoundingClientRect();
				target_size[1] = b.height;

				target_element.style.height = `${b.height}px`;
				target_element.style.position = 'absolute';
			}
			for (const [index, element] of elements.entries()) {
				if (index !== position && index !== last_position) {
					const b = element.getBoundingClientRect();
					element.style.width = `${b.width}px`;
					element.style.height = `${b.height}px`;
				}
				if (index === position) {
					if (previous_position < position)
						element.style.removeProperty('left');
					else
						element.style.removeProperty('right');
				} else if (index < position) {
					element.style.removeProperty('left');
				} else {
					element.style.removeProperty('right');
				}
				element.style.removeProperty('visibility');
			}
			
			animate(timestamp);
		});
		last_position = position;
	}

	onMount(() => {
		elements = Array.from(root_element.children).filter(item => item instanceof HTMLElement) as HTMLElement[];
		for (const [index, element] of elements.entries()) {
			if (index !== position) {
				element.style.top = '0';
				element.style.left = '100%';
				element.style.position = 'absolute';
				element.style.visibility = 'hidden';
			}
		}
	});
</script>

<div class="page_slider" bind:this={root_element}>
	<slot/>
</div>

<style lang="scss">
	.page_slider {
		width: 100%;
		min-height: fit-content;
		overflow: hidden;
		position: relative;
		min-width: inherit;
	}
</style>