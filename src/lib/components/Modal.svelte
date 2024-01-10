<script lang="ts">
	import { onMount } from 'svelte';

	export let autoOpen = false;
	export const trigger = () => dialog.open ? dialog.close() : dialog.showModal();
	export const close = () => dialog.close();

	let dialog: HTMLDialogElement;

	if (autoOpen)
		onMount(trigger);
</script>

<dialog bind:this={dialog}>
	<div class="content">
		<slot/>
	</div>
	<div id="absolute-solver"/>
</dialog>

<style lang="scss">
	dialog {
		width: 100%;
		height: 100%;
		background: none;
		.content {
			top: 50%;
			left: 50%;
			color: var(--color-primary);
			border: none;
			margin: auto;
			outline: none;
			padding: 32px; 
			position: absolute;
			overflow: hidden auto;
			min-width: 512px;
			font-size: initial;
			animation: .5s show;
			transform: translate(-50%, -50%);
			max-height: 90%;
			box-sizing: border-box;
			background: var(--background-primary);
			box-shadow: inset 0 0 0 1px #ffffff40;
			font-weight: initial;
			border-radius: 40px;
			flex-direction: column;
			transform-origin: 0 0;
			:global(h1:first-child) {
				margin-top: 12px;
			}
		}
		&::slotted {
			animation: .25s show;
		}
		&::backdrop {
			animation: 1s show-backdrop;
			background: #00000080;
			backdrop-filter: blur(8px);
		}
	}

	@keyframes show {
		0% {}
		0.001% {
			opacity: 0;
			transform: scale(0.9) translate(-50%, calc(-50% + 32px));
		}
		100% {
			opacity: 1;
		}
	}
	@keyframes show-backdrop {
		0% {
			opacity: 0;
		}
	}
</style>