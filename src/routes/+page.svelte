<script lang="ts">
	import optimise_image from '$lib/shared/optimise_image';
	
	import { PUBLIC_SITE_URL, PUBLIC_SOCIAL_LINK_DISCORD } from '$env/static/public';
	
	import DiscordIcon from '$lib/interface/visuals/socials/discord_icon.svelte';
</script>

<script module>
	export const last_updated_at = '2025-04-23';
</script>

<div class="marketing">
	<div class="thumbnail_container">
		<img
			class="thumbnail_image"
			fetchpriority="high"
			srcset={optimise_image('/asset/image/landing_thumbnail.png', [600, 1200], 60)}
			alt="Library Landing Thumbnail"
		/>
	</div>
	<div class="thumbnail_gradient"></div>
	<h1>We're a passionate dream studio.</h1>
	<p>HAKUMI is an up-and-coming technology studio fuelled by creativity and experimentation.<br/>We aspire to create simple & friendly software that just works, along with video game development!</p>
	
	<a class="discord_button" href={PUBLIC_SOCIAL_LINK_DISCORD} target="_blank">
		<DiscordIcon size={20}/>Join the community!
	</a>
</div>

<svelte:head>
	<svelte:element this={'script'} type="application/ld+json">
		{`{
	"@context": "https://schema.org",
	"@type": "WebSite",
	"name": "HAKUMI",
	"url": "${PUBLIC_SITE_URL}"
}`}
	</svelte:element>
</svelte:head>

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
			max-width: 100%;
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
			background: radial-gradient(at 50% 50%, #ff0055 35%, #c73a2a80 55%, transparent 70%);
			height: 800px;
			left: 50%;
			max-width: 100%;
			opacity: .05;
			position: absolute;
			top: 256px;
			transform: translate3d(-50%, -50%, 0);
			width: 1000px;
			z-index: -1;
		}
		h1 {
			color: transparent;
			background: linear-gradient(to right, #d07c98 5%, #e1779b 10%, #e1779b 15%, #d0847c 85%, #d0847c 90%, #edafa1 95%);
			background-clip: text;
			font-family: var(--font-secondary);
			font-size: 36px;
			font-weight: 450;
			margin: 24px 0 0;
			text-align: center;
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
				background: radial-gradient(at 50% 50%, #5865F20a 0%, transparent 70%);
				content: '';
				height: 120px;
				left: 50%;
				position: absolute;
				top: 50%;
				transform: translate(-50%, -50%);
				width: calc(100% + 120px);
				z-index: -1;
			}
		}
	}
</style>