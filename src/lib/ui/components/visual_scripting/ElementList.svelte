<script lang="ts">
	import { flip } from 'svelte/animate';
	import { onMount } from 'svelte';

	import { assert } from '$lib/shared/util';
	import type { Element, Document } from '$lib/shared/types/visual_scripting';
	import { find_visual_scripting_element_by_id, calculate_visual_scripting_element_size } from '$lib/client/model/visual_scripting';

	import ElementListItem from './ElementListItem.svelte';
	export let items: Element[];
	export let is_root = false;
	export let position = 0;
	export let document: Document;
	export let focused_id: string | null = null;
	export let dragging_id: string | null = null;
	export let dragging_size = 52;
	export let drag_position: number | null = null;

	let last_dragging_id = dragging_id;
	$: if (dragging_id)
		last_dragging_id = dragging_id;

	function calculate_offset(index: number, dragging_id?: string | null): number {
		console.log(index);

		let offset = 0;
		for (let i = 0; i < index; i++) {
			const item = items[i];
			if (item.id !== dragging_id)
				offset += calculate_visual_scripting_element_size(items[i], dragging_id) + 24;
		}

		return offset;
	}

	let element: HTMLDivElement;
	if (is_root) {
		let dragging: {
			item: Element
			active: boolean
			item_id: string
			element: HTMLElement
			source_list: Element[]
			mouse_offset: number
		} | null = null;
		onMount(() => {
			const abort_controller = new AbortController();
			element.addEventListener('mouseup', () => {
				if (dragging) {
					if (!dragging.active)
						return dragging = null;

					// typescript didn't allow defining the type on the variable here for some reason
					let maybe = null as [Element, Element[]] | null;
					let position = 0;
					console.log(drag_position);
					function iterate(iterate_items: Element[]) {
						for (const item of iterate_items)
							if (item.id !== dragging!.item_id) {
								const size = calculate_visual_scripting_element_size(item);
								if (item.kind === 'statement.if' && drag_position! >= position + 52 && drag_position! <= position + size - 52) {
									console.log('statement');
									if (item.blocks[0].items.length) {
										iterate(item.blocks[0].items);
									} else {
										dragging!.source_list.splice(dragging!.source_list.indexOf(dragging!.item), 1);
										item.blocks[0].items = [dragging!.item];
										items = [...items];
										break;
									}
								} if (drag_position! <= position + 28 && drag_position! >= position - dragging_size / 2) {
									maybe = [item, iterate_items];
									break;
								}
								position += size;
							}
					}

					const end_position = calculate_offset(items.length, dragging_id);
					if (drag_position! < 0) {
						dragging.source_list.splice(dragging.source_list.indexOf(dragging.item), 1);
						items = [dragging.item, ...items];
					} else if (drag_position! > end_position) {
						dragging.source_list.splice(dragging.source_list.indexOf(dragging.item), 1);
						items = [...items, dragging.item];
					} else
						iterate(items);
					console.log(maybe);
					if (maybe) {
						const [item, item_list] = maybe;
						dragging.source_list.splice(dragging.source_list.indexOf(dragging.item), 1);
						item_list.splice(item_list.indexOf(item), 0, dragging.item);
						items = [...items];
					}

					dragging.element.style.removeProperty('z-index');
					dragging.element.style.removeProperty('position');
					dragging = dragging_id = drag_position = null;
				}
			}, { signal: abort_controller.signal });
			element.addEventListener('mousemove', (event: MouseEvent) => {
				if (dragging) {
					const { item, element: drag_element } = dragging;
					if (!dragging.active) {
						dragging_id = item.id;
						dragging_size = calculate_visual_scripting_element_size(item);
						drag_element.style.zIndex = '1000000';
						drag_element.style.position = 'absolute';

						dragging.active = true;
					}

					const position = drag_position = event.clientY - element.getBoundingClientRect().y - 24 - dragging.mouse_offset;
					drag_element.style.top = `${position + 24}px`;
				}
			}, { signal: abort_controller.signal });
			element.addEventListener('mousedown', event => {
				const { clientY } = event;

				let target = (event.target as HTMLElement).parentElement;
				if (target) {
					const item_id = target.getAttribute('data-id') ?? ((target as any) = target.parentElement)?.getAttribute('data-id');
					if (item_id) {
						const item_id = target.getAttribute('data-id')!;
						const [item, source_list] = assert(find_visual_scripting_element_by_id(items, item_id));
						dragging = {
							item,
							active: false,
							item_id,
							element: target,
							source_list,
							mouse_offset: clientY - target.getBoundingClientRect().y
						};
					}
				}
			}, { signal: abort_controller.signal });

			return () => abort_controller.abort();
		});
	}
</script>

<div class="visual_scripting_element_list" class:is_root bind:this={element}>
	{#each items as item, index (item.id)}
		<div class="visual_scripting_element_group theme-dark" data-id={item.id} animate:flip={{ duration: item.id === last_dragging_id ? 500 : 0 }}>
			<ElementListItem bind:item bind:items={items} position={position + calculate_offset(index, dragging_id)} bind:focused_id {document} {drag_position} {dragging_id} {dragging_size}/>
		</div>
	{/each}
</div>

<style>
	.visual_scripting_element_list {
		gap: 24px;
		display: flex;
		padding: 24px 0 24px 24px;
		align-items: center;
		flex-direction: column;
		&.is_root {
			position: relative;
		}
	}
	.visual_scripting_element_group {
		width: 640px;
		max-width: 100%;
		&:is(#dnd-action-dragged-el) :global(.visual_scripting_element) {
			box-shadow: 0 0 8px 2px #00000050;
		}
	}
</style>