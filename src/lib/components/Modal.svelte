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
	<slot/>
</dialog>

<style lang="scss">
	dialog {
		color: var(--color-primary);
		border: none;
		outline: none;
		padding: 32px; 
		overflow: hidden auto;
		min-width: 512px;
		font-size: initial;
		animation: .5s show;
		max-height: 90%;
		box-sizing: border-box;
		background: var(--background-primary);
		box-shadow: inset 0 0 0 1px #ffffff40;
		font-weight: initial;
		border-radius: 40px;
		flex-direction: column;
		:global(h1:first-child) {
			margin-top: 12px;
		}
		&[open] {
			display: flex;
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
		0% {
			opacity: 0;
			transform: scale(0.9) translateY(32px);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes show-backdrop {
		0% {
			opacity: 0;
		}
	}
</style>