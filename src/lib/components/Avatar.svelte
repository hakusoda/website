<script lang="ts">
	import { getDefaultAvatar } from '$lib/util';
	export let id: string = '0';
	export let src: string | null = null;
	export let size: 'xxxs' | 'xxs' | 'xs' | 'sm' | 'sm2' | 'md' | 'lg' | 'lg2' | 'xl' = 'lg';
	export let hover = false;
	export let circle = false;
	export let background = '';
	export let transparent = false;

	$: style = `background: ${background};`;
	$: className = `avatar ${size}${circle && src ? ' circle' : ''}${transparent ? ' transparent' : ''}${hover ? ' hover' : ''}`;

	$: image = src || getDefaultAvatar(id);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class={className} {style} on:click>
	<img src={image} alt="avatar"/>
	<slot/>
</div>

<style lang="scss">
	.avatar {
		color: var(--color-secondary);
		display: flex;
		position: relative;
		background: var(--background-secondary);
		align-items: center;
		justify-content: center;
		img {
			width: inherit;
			height: inherit;
			border-radius: inherit;
		}
		&.xxxs {
			width: 16px;
			height: 16px;
			border-radius: 4px;
			:global(svg) {
				width: 8px;
				height: 8px;
			}
		}
		&.xxs {
			width: 24px;
			height: 24px;
			border-radius: 4px;
			:global(svg) {
				width: 16px;
				height: 16px;
			}
		}
		&.xs {
			width: 32px;
			height: 32px;
			border-radius: 4px;
			:global(svg) {
				width: 16px;
				height: 16px;
			}
			&.hover {
				filter: drop-shadow(0 2px 4px #000000);
			}
		}
		&.sm {
			width: 48px;
			height: 48px;
			border-radius: 4px;
			:global(svg) {
				width: 24px;
				height: 24px;
			}
		}
		&.sm2 {
			width: 64px;
			height: 64px;
			border-radius: 4px;
			:global(svg) {
				width: 24px;
				height: 24px;
			}
			&.hover {
				filter: drop-shadow(0 8px 8px #00000080);
			}
		}
		&.md {
			width: 96px;
			height: 96px;
			border-radius: 8px;
		}
		&.lg {
			width: 128px;
			height: 128px;
			box-shadow: 0 8px 16px 2px #00000040;
			border-radius: 8px;
			:global(svg) {
				width: 48px;
				height: 48px;
			}
		}
		&.xl {
			width: 256px;
			height: 256px;
			border-radius: 8px;
		}
		&.circle {
			border-radius: 50%;
		}
		&.transparent {
			box-shadow: none;
			background: none;
		}
		&.hover {
			filter: drop-shadow(0 16px 8px #00000040);
			background: none;
			box-shadow: none;
		}
	}
</style>