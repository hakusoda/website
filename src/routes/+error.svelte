<script>
	import { t } from '$lib/localisation';
    import { page } from '$app/stores';
</script>

<div class="main">
	<h1>{$t('error.page')}</h1>
	<h2>{$t('error.page2')}</h2>
	<p>{$t('error.page3', [$page.status, $page.error.message])}</p>
</div>

<style lang="scss">
	.main {
		margin: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			font-size: 3em;
			margin-bottom: 0;
		}
	}
</style>