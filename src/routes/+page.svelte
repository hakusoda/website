<script lang="ts">
	import optimise_image from '$lib/shared/optimise_image';
	
	import { PUBLIC_SOCIAL_LINK_DISCORD } from '$env/static/public';
	
	import DiscordIcon from '$lib/interface/visuals/socials/discord_icon.svelte';
</script>

<script module>
	export const last_updated_at = '2025-04-23';
</script>

<div class="marketing">
	<div class="thumbnail_container">
		<img
			class="thumbnail_image"
			srcset={optimise_image('/asset/image/landing_thumbnail.png', [600, 1200], 60)}
			alt="Library Landing Thumbnail"
		/>
	</div>
	<div class="thumbnail_gradient">
		<div class="gradient gradient_base"></div>
		<div class="gradient gradient_ring"></div>
	</div>
	<h1>We're a passionate dream studio.</h1>
	<p>HAKUMI is an up-and-coming technology studio fuelled by creativity and experimentation.<br/>We aspire to create simple & friendly software that just works, along with video game development!</p>
	
	<a class="discord_button" href={PUBLIC_SOCIAL_LINK_DISCORD} target="_blank">
		<DiscordIcon size={20}/>Join the community!
	</a>
</div>

<style lang="scss">
	.marketing {
		align-items: center;
		display: flex;
		flex-direction: column;
		margin-top: 24px;
		min-height: inherit;
		width: 100%;
		.thumbnail_container {
			aspect-ratio: 16 / 8;
			border-radius: 16px;
			box-shadow: 0 2px 10px 0 hsl(0 calc(1 * 0%) 0% / 0.2);
			overflow: hidden;
			position: relative;
			width: 600px;
			.thumbnail_image {
				height: 100%;
				object-fit: cover;
				object-position: center;
				width: 100%;
			}
			&:before {
				border-radius: 15px;
				box-shadow: inset 0 0 0 1px #fff;
				content: '';
				height: 100%;
				left: 0;
				mask: linear-gradient(to bottom, #fff, transparent 24px);
				mix-blend-mode: soft-light;
				position: absolute;
				pointer-events: none;
				width: 100%;
				top: 0;
			}
			&:after {
				border-radius: 15px;
				box-shadow: inset 0 0 0 1px hsl(250 0% 0%);
				content: '';
				height: 100%;
				left: 0;
				mask: linear-gradient(to bottom, transparent calc(100% - 24px), #fff);
				mix-blend-mode: hard-light;
				position: absolute;
				width: 100%;
				top: 0;
			}
		}
		.thumbnail_gradient {
			filter: blur(150px);
			height: 600px;
			left: 50%;
			opacity: .15;
			position: absolute;
			top: 256px;
			transform: translate(-50%, -50%);
			transition: filter 2s;
			width: 700px;
			z-index: -1;
			.gradient {
				border-radius: 50%;
				left: 50%;
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
			}
			.gradient_base {
				background: #ff0055;
				height: 60%;
				width: 80%;
			}
			.gradient_ring {
				border: 15px solid #c73a2a;
				height: 160%;
				width: 160%;
			}
		}
		h1 {
			color: transparent;
			background: linear-gradient(to right, #d07c98 5%, #e1779b 10%, #e1779b 15%, #d0847c 85%, #d0847c 90%, #edafa1 95%);
			background-clip: text;
			font-family: 'Outfit', sans-serif;
			font-size: 36px;
			font-weight: 450;
			margin: 24px 0 0;
		}
		p {
			color: transparent;
			background: linear-gradient(135deg, #af6c81, #b28b87);
			background-clip: text;
			font-size: .9em;
			margin-bottom: 192px;
			text-align: center;
		}
		.discord_button {
			align-items: center;
			color: #fff;
			background: #5865F2;
			border-radius: 8px;
			box-shadow: inset 0 0 0 1px #ffffff40;
			display: flex;
			font-size: .95em;
			font-weight: 450;
			gap: 12px;
			height: 40px;
			padding: 0 16px;
			position: relative;
			text-decoration: none;
			&:before {
				background: #5865F20a;
				content: '';
				filter: blur(20px);
				height: 80px;
				left: 50%;
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
				width: calc(100% + 40px);
				z-index: -1;
			}
		}
	}
</style>