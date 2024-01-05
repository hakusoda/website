<script>
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
    import { page } from '$app/stores';
	import { RequestErrorType } from '$lib/enums';

	import AppLayout from '$lib/layouts/AppLayout.svelte';

	import Discord from '$lib/icons/Discord.svelte';
	import ArrowClockwise from '$lib/icons/ArrowClockwise.svelte';
	export let data;

	$: status = $page.status;

	let message;
	$: try {
		message = $t(`request_error.${Number(JSON.parse($page.error.message).error)}`);
	} catch (err) {}
</script>

<AppLayout {...data}>
	<div class="request-error">
		<h1>{$t('error.page')}</h1>
		<h2>{$t('error.page2')}</h2>
		<p>
			{#if status === 403}
				{$t(`request_error.${RequestErrorType.Unauthorised}`)}
			{:else if status === 404}
				{$t(`request_error.${RequestErrorType.NotFound}`)}
			{:else if message}
				{message}
			{:else}
				{$t('error.page3', [status, $page.error.message])}
			{/if}
		</p>
		<div class="buttons">
			<Button on:click={() => location.reload()}>
				<ArrowClockwise/>{$t('action.retry')}
			</Button>
			<Button href="https://discord.com/invite/rs3r4dQu9P" colour="secondary" target="_blank">
				<Discord/>{$t('action.get_support')}
			</Button>
		</div>
	</div>
</AppLayout>

<style lang="scss">
	.request-error {
		margin: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			font-size: 3em;
			margin-bottom: 0;
		}
		p {
			color: var(--color-secondary);
		}
		.buttons {
			gap: 16px;
			display: flex;
			margin-top: 32px;
		}
	}
</style>