<script lang="ts">
	import { t } from '../localisation';
</script>

<div class="mellow-ad">
	<svg width="32" height="32" viewBox="0 0 5 5" fill="none" xmlns="http://www.w3.org/2000/svg">
		<g filter="url(#filter0_d_28_8)">
			<path d="M0.5 2.5C0.258364 2.5 0.137546 2.5 0.0635423 2.57844C-0.0104618 2.65688 -0.00380019 2.77123 0.00952304 2.99994C0.0566057 3.80817 0.336469 4.5 2 4.5C3.66353 4.5 3.94339 3.80817 3.99048 2.99994C4.0038 2.77123 4.01046 2.65688 3.93646 2.57844C3.86245 2.5 3.74164 2.5 3.5 2.5C3.29991 2.5 3.19986 2.5 3.13259 2.55151C3.06532 2.60302 3.02987 2.7343 2.95897 2.99685C2.88104 3.28543 2.65509 3.5 2 3.5C1.34491 3.5 1.11896 3.28543 1.04103 2.99685C0.970129 2.7343 0.934677 2.60302 0.867409 2.55151C0.80014 2.5 0.700093 2.5 0.5 2.5Z" fill="white"/>
			<path d="M3.5 0.5C3.2643 0.5 3.14645 0.5 3.07322 0.573223C3 0.646447 3 0.764298 3 1C3 1.2357 3 1.35355 3.07322 1.42678C3.14645 1.5 3.2643 1.5 3.5 1.5C3.7357 1.5 3.85355 1.5 3.92678 1.42678C4 1.35355 4 1.2357 4 1C4 0.764298 4 0.646447 3.92678 0.573223C3.85355 0.5 3.7357 0.5 3.5 0.5Z" fill="white"/>
			<path d="M0 1C0 0.764298 0 0.646447 0.0732233 0.573223C0.146447 0.5 0.264298 0.5 0.5 0.5C0.735702 0.5 0.853553 0.5 0.926777 0.573223C1 0.646447 1 0.764298 1 1C1 1.2357 1 1.35355 0.926777 1.42678C0.853553 1.5 0.735702 1.5 0.5 1.5C0.264298 1.5 0.146447 1.5 0.0732233 1.42678C0 1.35355 0 1.2357 0 1Z" fill="white"/>
		</g>
		<defs>
			<filter id="filter0_d_28_8" x="0" y="0.5" width="4.25" height="4.25" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
				<feFlood flood-opacity="0" result="BackgroundImageFix"/>
				<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
				<feOffset dx="0.25" dy="0.25"/>
				<feComposite in2="hardAlpha" operator="out"/>
				<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
				<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_28_8"/>
				<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_28_8" result="shape"/>
			</filter>
		</defs>
	</svg>			
	<div class="details">
		<h1>{$t('settings.roblox.accounts.syncing')}</h1>
		<p><a href="/project/mellow">mellow</a> {$t('settings.roblox.accounts.syncing.summary')}</p>
	</div>
</div>

<style lang="scss">
	.mellow-ad {
		width: fit-content;
		height: 64px;
		display: flex;
		padding: 0 32px;
		margin-top: 64px;
		box-shadow: inset 0 0 0 1px #ffffff40;
		background: 100% center url('/img/mellow-banner.svg');
		align-items: center;
		border-radius: 32px;
		.details {
			margin-left: 24px;
			h1 {
				margin: 0;
				font-size: 1em;
				font-weight: 500;
			}
			p {
				margin: 6px 0 0;
				font-size: .8em;
				a {
					color: var(--color-link);
				}
			}
		}
	}
</style>