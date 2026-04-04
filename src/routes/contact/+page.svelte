<script lang="ts">
	import optimise_image from '$lib/shared/optimise_image';
	
	import { PUBLIC_SOCIAL_LINK_DISCORD } from '$env/static/public';
	
	let form_subject = $state('');
	let form_body = $state('');
	function submit_form(event: Event) {
		event.preventDefault();
		window.location.href = `mailto:hello@hakumi.cafe?subject=${encodeURIComponent(form_subject)}&body=${encodeURIComponent(form_body)}`;
	}
</script>

<script module>
	export const last_updated_at = '2025-04-23';
</script>

<div class="marketing">
	<div class="thumbnail_container">
		<img
			class="thumbnail_image"
			srcset={optimise_image('/asset/image/contact_thumbnail.png', [600, 1200], 60)}
			alt="Contact Landing Thumbnail"
		/>
	</div>
	<div class="thumbnail_gradient">
		<div class="gradient gradient_base"></div>
		<div class="gradient gradient_ring"></div>
	</div>
	<h1>Contact Us</h1>
	<p>Hi! Looking to reach out? Feel free to send us an email down below—we accept love letters!<br/>Alternatively, you can also hang out with us at <a href={PUBLIC_SOCIAL_LINK_DISCORD}>The HAKUMI Café</a> on Discord!</p>
	
	<form action="mailto:hello@hakumi.cafe" method="post" enctype="text/plain" onsubmit={submit_form}>
		<div>
			<label for="subject">Subject</label>
			<input type="text" name="subject" required bind:value={form_subject}>
		</div>
		<div>
			<label for="body">Message</label>
			<textarea name="body" required bind:value={form_body}></textarea>
		</div>
		
		<button type="submit">Send Email</button>
	</form>
</div>

<svelte:window onbeforeunload={event => {
	if (!form_subject && !form_body)
		return;
	event.preventDefault();
	event.returnValue = '';
}}/>

<style lang="scss">
	form {
		max-width: 100%;
		width: 500px;
		div {
			display: flex;
			flex-direction: column;
			margin-bottom: 24px;
		}
		label {
			color: #ffffff80;
			font-size: 14px;
			margin-bottom: 4px;
		}
		input[type="text"] {
			height: 40px;
		}
		textarea {
			height: 128px;
		}
		input[type="text"], textarea {
			background: #33333340;
			border: 1px solid #ffffff1a;
			border-radius: 12px;
			color: #fff;
			font-size: 14px;
			padding: 8px 16px;
			z-index: 1;
		}
		button {
			align-items: center;
			color: #fff;
			background: #e14d7e;
			border: none;
			border-radius: 8px;
			box-shadow: inset 0 0 0 1px #ffffff40;
			cursor: pointer;
			display: flex;
			font-size: .95em;
			font-weight: 450;
			gap: 12px;
			height: 40px;
			justify-content: center;
			padding: 0 16px;
			position: relative;
			text-decoration: none;
			transition: opacity .5s;
			width: 100%;
			&:before {
				background: #e14d7e1a;
				content: '';
				filter: blur(20px);
				height: 80px;
				left: 50%;
				position: absolute;
				top: 50%;
				transform: translate3d(-50%, -50%, 0);
				width: calc(100% + 40px);
				z-index: -1;
			}
		}
		&:invalid button {
			cursor: not-allowed;
			opacity: .5;
		}
	}
	
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
			filter: blur(150px);
			height: 600px;
			left: 50%;
			max-width: 100%;
			opacity: .15;
			overflow: hidden;
			position: absolute;
			top: 256px;
			transform: translate3d(-50%, -50%, 0);
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
			text-align: center;
		}
		p {
			color: transparent;
			background: linear-gradient(135deg, #af6c81, #b28b87);
			background-clip: text;
			font-size: .9em;
			margin-bottom: 48px;
			text-align: center;
			a {
				color: var(--color-secondary-hover);
				text-decoration: none;
			}
		}
	}
</style>