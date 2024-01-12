<script lang="ts">
	import 'cropperjs/dist/cropper.css';
	import Cropper from 'cropperjs';
	import { Button } from '@hakumi/essence';
	import { onDestroy } from 'svelte';

	import { t } from '../localisation';
	import Avatar from './Avatar.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	export let name: string;
	export let image: string | null = null;
	export let circle = true;
	export let result: ArrayBuffer | null;
	export let resultUri: string | null;

	let img: HTMLImageElement;
	let zoom = 1;
	let crop = { x: 0, y: 0 };
	let files: FileList;
	let input: HTMLInputElement;
	let image2: string | null = null;
	let cropper: Cropper | null = null;
	const change = () => {
		const reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onload = event => {
			const value = image2 = event.target!.result as any;
			cropper?.replace(value);
		};
	};

	$: if (!img && cropper)
		cropper.destroy(), cropper = null;
	onDestroy(() => (cropper?.destroy(), cropper = null));

	const createCropper = () => cropper = new Cropper(img, {
		viewMode: 1,
		rotatable: false,
		background: false,
		aspectRatio: 1,
		autoCropArea: 1,
		crop: event => {
			const a = 128 / img.naturalWidth;
			zoom = img.naturalWidth / event.detail.width;
			crop.x = -event.detail.x * zoom * a, crop.y = -event.detail.y * zoom * a;
		}
	});
	const finish = () => {
		const canvas = cropper!.getCroppedCanvas();
		canvas.toBlob(blob => blob?.arrayBuffer().then(b => result = b), 'image/webp');
		
		resultUri = canvas.toDataURL();
		image2 = null;
	};
</script>

<div class="avatar-file">
	{#if image}
		<Avatar src={image} size="sm" {circle}/>
	{/if}
	<Button on:click={() => input.click()}>
		{$t('action.choose_file')}
	</Button>
	<p class="size">{$t('avatar_file.size')}</p>
	<input type="file" bind:this={input} bind:files on:change={change}/>
</div>

{#if image2}
	<div class="avatar-cropper">
		<div class="avatar-cropper-modal">
			<div class="cropper" class:circle>
				<img src={image2} alt="" bind:this={img} on:load={createCropper}/>
			</div>
			<div class="controls">
				<div class="preview">
					<div class="avatar" class:circle style={`--i: url("${image2}"); --z: ${zoom * 100}%; --x: ${crop.x}px; --y: ${crop.y}px;`}/>
					<h1>{name}</h1>
				</div>
				<div class="buttons">
					<Button on:click={finish}>
						<Check/>{$t('action.finish')}
					</Button>
					<Button on:click={() => image2 = null}>
						<X/>{$t('action.cancel')}
					</Button>
					<Button on:click={() => input.click()}>
						{$t('action.choose_file')}
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.avatar-file {
		gap: 16px;
		display: flex;
		align-items: center;
		input {
			display: none;
		}
		.size {
			color: var(--color-secondary);
			margin: 0;
			font-size: .8em;
		}
	}
	.avatar-cropper {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		z-index: 1000;
		position: fixed;
		background: #00000080;
		.avatar-cropper-modal {
			margin: auto;
			padding: 16px;
			display: flex;
			background: var(--background-secondary);
			border-radius: 16px;
			.cropper {
				min-width: 256px;
				max-width: 256px;
				min-height: 256px;
				max-height: 256px;
				img {
					display: block;
					max-width: 100%;
				}
				:global(.cropper-line) {
					opacity: 1;
				}
				:global(.cropper-view-box) {
					outline: 1px solid #39f;
				}
				:global(.dashed-h) {
					left: 3.5%;
					width: 93%;
				}
				:global(.dashed-v) {
					top: 3.5%;
					height: 93%;
				}
				:global(.line-w), :global(.line-e) {
					width: 1px;
					margin: 0 2px;
				}
				:global(.line-n), :global(.line-s) {
					height: 1px;
					margin: 2px 0;
				}
				:global(.cropper-modal), :global(.cropper-wrap-box) {
					border-radius: 4px;
				}
				:global(.cropper-wrap-box) {
					overflow: hidden;
				}
				&.circle {
					:global(.cropper-view-box), :global(.cropper-face) {
						border-radius: 50%;
					}
				}
			}
			.controls {
				display: flex;
				margin-left: 16px;
				flex-direction: column;
				.preview {
					margin: 32px 0 0;
					display: flex;
					align-items: center;
					.avatar {
						width: 128px;
						height: 128px;
						background: var(--i);
						box-shadow: 0 8px 16px 2px #00000040;
						border-radius: 8px;
						background-size: var(--z);
						background-position: var(--x) var(--y);
						&.circle {
							border-radius: 50%;
						}
					}
					h1 {
						margin: 0 32px 0 32px;
						font-size: 2.5em;
					}
				}
				.buttons {
					gap: 16px;
					display: flex;
					margin-top: auto;
					:global(button:last-child) {
						margin-left: auto;
					}
				}
			}
		}
	}
</style>