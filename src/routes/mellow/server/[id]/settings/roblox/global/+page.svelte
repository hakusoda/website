<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import Check from '$lib/icons/Check.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	let defaultNickname = data.default_nickname;
	const save = async () => {
		saving = !(error = null);
		const response = await fetch('?/edit', {
			body: JSON.stringify({ defaultNickname }),
            method: 'POST'
        });
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			location.reload();
		} else if (result.type === 'failure')
			saving = !(error = result.data as any);
		else if (result.type === 'error')
			saving = !(error = { error: RequestErrorType.Offline });
	};

	$: nickLength = defaultNickname.includes('{name}') ? defaultNickname.length + 14 : defaultNickname.length;
</script>

<div class="main">
	<p class="input-label">{$t('mellow.server.settings.roblox.global.nickname')}</p>
	<p class="summary">{$t('mellow.server.settings.roblox.global.nickname.summary')}</p>
	
	<p class="indicator">{nickLength}/32</p>
	{#if nickLength > 32 && defaultNickname.length < 33}
		<p class="indicator">{$t('mellow.server.settings.roblox.global.nickname.long')}</p>
	{/if}
	<TextInput bind:value={defaultNickname} placeholder={$t('mellow.server.settings.roblox.global.nickname.placeholder')}/>

	<RequestErrorUI data={error} background="var(--background-primary)"/>
	<div class="buttons">
		<Button on:click={save} disabled={saving || defaultNickname === data.default_nickname}>
			<Check/>{$t('action.save_changes')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 32px 0 32px 64px;
		.input-label {
			color: var(--color-secondary);
			margin: 32px 0 8px;
			font-size: .9em;
		}
		.summary {
			color: var(--color-tertiary);
			margin: 0 0 16px;
			font-size: .75em;
			white-space: pre;
			line-height: 1.5;
		}
		.indicator {
			color: var(--color-secondary);
			margin: 0 0 4px;
			font-size: .75em;
		}
		:global(.text-input) {
			min-width: 256px;
		}
		.buttons {
			margin-top: 24px;
		}
	}
</style>