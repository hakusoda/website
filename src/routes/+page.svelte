<script lang="ts">
	import { t } from '$lib/localisation';
</script>

<div class="landing">
	<img src="/landing.gif" alt="Landing Banner" width="688" height="311.5">
	<p>{$t('home.landing')}</p>
</div>

<svelte:head>
	<title>Voxelified</title>
	<meta content="Voxelified Home" property="og:title">
</svelte:head>

<style lang="scss">
	.landing {
		height: 100%;
		padding: 32px 64px;
		display: flex;
		overflow: hidden;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		img {
			height: auto;
			max-width: 100%;
			border-radius: 16px;
		}
		p {
			color: var(--color-tertiary);
			margin-top: 16px;
		}
	}
</style>