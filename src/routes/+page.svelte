<script lang="ts">
	import { t } from '$lib/localisation';
</script>

<div class="landing">
	<img src="/landing.gif" alt="Landing Banner" width="688" height="311.5">
	<p>{$t('home.landing')}</p>
</div>

<svelte:head>
	<title>voxelified</title>
</svelte:head>

<style lang="scss">
	.landing {
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
		img {
			border-radius: 16px;
		}
		p {
			color: var(--color-tertiary);
			margin-top: 16px;
		}
	}
</style>