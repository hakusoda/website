<script lang="ts">
	import { t } from '$lib/ui/localisation';
</script>

<div class="landing">
	<h1>{$t('home.landing')}</h1>
	<p>{$t('home.landing.sub')}</p>

	<a href="https://miku.hakumi.cafe" target="_blank">
		<img src="https://miku.hakumi.cafe/miku.gif" alt="Landing Banner">
	</a>
</div>

<svelte:head>
	<title>HAKUMI</title>
	<meta content="HAKUMI" property="og:title">
</svelte:head>

<style lang="scss">
	.landing {
		display: flex;
		min-height: calc(100svh - 58px);
		align-items: center;
		flex-direction: column;
		justify-content: center;
		h1 {
			margin: 0 0 24px;
			font-size: 2.5em;
			font-weight: 750;
		}
		p {
			color: var(--color-secondary);
			margin: 0 0 40px;
		}
		img {
			width: 256px;
			height: auto;
			margin: 0 0 64px;
			max-width: 50vw;
			border-radius: 16px;
		}
	}
</style>