<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { ApiRequestError } from '$lib/types';
	import { generateMellowServerApiKey } from '$lib/api';

	import RequestError from '$lib/components/RequestError.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	export let data;

	let key: string | null = null;
	let error: ApiRequestError | null = null;
	let generating = false;
	const generate = async () => {
		generating = true;
		const response = await generateMellowServerApiKey($page.params.id);
		if (response.success)
			key = response.data.api_key;
		else
			error = response;
		generating = false;
	};
</script>

<div class="header">
	<h2>{$t('mellow.server.settings.api.key')}</h2>
	<p>{$t('mellow.server.settings.api.key.summary')}</p>
</div>
{#if key}
	<p class="key">
		{$t('mellow.server.settings.api.key.new', [key])}
	</p>
{:else if data.api_key_created_at}
	<p class="exists">
		{$t('mellow.server.settings.api.key.exists', [data.name, data.api_key_created_at])}
	</p>
{/if}
<Button on:click={generate} disabled={generating}>
	<Plus/>{$t('mellow.server.settings.api.key.generate')}
</Button>

<RequestError data={error}/>

<style lang="scss">
	.key {
		font-size: .9em;
	}
	.exists {
		color: #7dc4e8;
		font-size: .9em;
	}
</style>