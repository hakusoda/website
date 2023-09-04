<script lang="ts">
	import ImagePreview from '../modals/ImagePreview.svelte';
	export let src: string;

	let trigger: () => void;
</script>

<button type="button" class="profile-post-attachment" on:click|preventDefault={trigger}>
	<img {src} alt=""/>
</button>
<ImagePreview {src} bind:trigger/>

<style lang="scss">
	.profile-post-attachment {
		flex: 1 0 0;
		width: 0;
		border: none;
		cursor: pointer;
		padding: 0;
		position: relative;
		overflow: hidden;
		background: none;
		transition: filter .5s;
		border-radius: 8px;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		&:hover {
			filter: brightness(1.25);
		}
	}
</style>