<script lang="ts">
	// https://github.com/Blookerss/svelteblox/blob/master/src/lib/components/Modal.svelte
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
		box-shadow: inset 0 0 0 1px #ffffff40;
		background: center / 200px repeat var(--grain), #00000040;
		font-weight: initial;
		border-radius: 52px;
		flex-direction: column;
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
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
			animation: 1s show-backdrop forwards;
			background: #00000080;
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
			backdrop-filter: none;
		}
		100% {
			opacity: 1;
			backdrop-filter: blur(8px);
		}
	}
</style>