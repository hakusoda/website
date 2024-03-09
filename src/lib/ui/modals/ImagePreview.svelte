<script lang="ts">
	export let src: string;
	export const trigger = () => dialog.showModal();

	let dialog: HTMLDialogElement;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialog} on:click|preventDefault={event => {
	if (event.target === dialog)
		dialog.close();
}}>
	<img {src} alt=""/>
</dialog>

<style lang="scss">
	dialog {
		color: var(--color-primary);
		margin: 0 auto;
		border: none;
		padding: 0;
		outline: none;
		overflow: visible;
		animation: .5s show;
		background: none;
		img {
			height: 100vh;
		}
		&::backdrop {
			animation: .5s show;
			background: #00000080;
		}
	}

	@keyframes show {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>