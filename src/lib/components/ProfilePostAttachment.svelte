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
		border-radius: 8px;
		img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
		&:after {
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			content: '';
			display: block;
			position: absolute;
			box-shadow: inset 0 0 0 1px #ffffff40;
			border-radius: inherit;
		}
	}
</style>