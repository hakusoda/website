<script lang="ts">
	export let src: Promise<string | null> | string | null = null;
	export let size: 'xxs' | 'xs' | 'sm' | 'sm2' | 'md' | 'lg' | 'lg2' | 'xl' = 'lg';
	export let circle = false;
	export let transparent = false;

	import Question from '../icons/Question.svelte';
	import Hourglass from '../icons/Hourglass.svelte';
	$: className = `avatar ${size}${circle ? ' circle' : ''}${transparent ? ' transparent' : ''}`;
</script>

{#if src}
	{#await src}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class={className} on:click><Hourglass/><slot/></div>
	{:then image}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div class={className} on:click>
			<img src={image} alt="avatar"/>
			<slot/>
		</div>
	{/await}
{:else}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class={className} on:click><Question size={32}/></div>
{/if}

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
			background: none;
		}
	}
</style>