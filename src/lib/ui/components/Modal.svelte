<script lang="ts">
	import './Modal.scss';
	import { onMount } from 'svelte';

	export let autoOpen = false;
	export const trigger = () => dialog.open ? dialog.close() : dialog.showModal();
	export const close = () => dialog.close();

	let dialog: HTMLDialogElement;

	if (autoOpen)
		onMount(trigger);
</script>

<dialog class="modal" bind:this={dialog}>
	<div class="modal_container">
		<slot/>
	</div>
	<div id="absolute-solver"/>
</dialog>

<style lang="scss">
	dialog {
		width: 100%;
		height: 100%;
		background: none;
		.modal_container {
			top: 50%;
			left: 50%;
			color: var(--color-primary);
			width: fit-content;
			border: none;
			height: fit-content;
			margin: auto;
			outline: none;
			position: absolute;
			overflow: hidden auto;
			font-size: initial;
			animation: .5s show;
			transform: translate(-50%, -50%);
			box-sizing: border-box;
			background: hsl(250 3% 20%);
			box-shadow: 0 0 0 1px hsl(225 calc(1 * 6.3%) 12.5% / 0.6), 0 2px 10px 0 hsl(0 calc(1 * 0%) 0% / 0.2);
			font-weight: initial;
			border-radius: 16px;
			flex-direction: column;
			transform-origin: 0 0;
			&:before {
				top: 0;
				left: 0;
				mask: linear-gradient(to bottom, #fff, transparent 24px);
				width: 100%;
				height: 100%;
				content: '';
				position: absolute;
				box-shadow: inset 0 0 0 1px #fff;
				border-radius: 17px;
				pointer-events: none;
				mix-blend-mode: soft-light;
			}
			/*&:after {
				top: 0;
				left: 0;
				mask: linear-gradient(to bottom, transparent calc(100% - 24px), #fff);
				width: 100%;
				height: 100%;
				content: '';
				position: absolute;
				box-shadow: inset 0 0 0 1px hsl(250 0% 0%);
				border-radius: 17px;
			}*/
		}
		&::slotted {
			animation: .25s show;
		}
		&::backdrop {
			animation: 1s show-backdrop;
			background: #00000080;
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