<script lang="ts">
	import { TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import Radio from '$lib/components/Radio.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';

	import RequestErrorUI from '$lib/components/RequestError.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	let defaultNickname = data.default_nickname;
	let syncUnknownUsers = data.sync_unknown_users;
	let allowForcedSyncing = data.allow_forced_syncing;
	const save = async () => {
		saving = !(error = null);
		const response = await fetch('?/edit', {
			body: JSON.stringify({
				defaultNickname: defaultNickname === data.default_nickname ? undefined : defaultNickname,
				syncUnknownUsers: syncUnknownUsers === data.sync_unknown_users ? undefined : syncUnknownUsers,
				allowForcedSyncing: allowForcedSyncing === data.allow_forced_syncing ? undefined : allowForcedSyncing
			}),
            method: 'POST'
        });
		const result = deserialize(await response.text());
		if (result.type === 'success')
			await invalidateAll();
		else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline };
		saving = false;
	};
	const reset = () => (defaultNickname = data.default_nickname, syncUnknownUsers = data.sync_unknown_users, allowForcedSyncing = data.allow_forced_syncing);

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

	<p class="input-label">{$t('mellow.server.settings.roblox.global.other')}</p>
	<div class="radio-input">
		<Radio bind:value={allowForcedSyncing}/>
		<p>{$t('mellow.server.settings.roblox.global.allow_forced_syncing')}</p>
	</div>
	<div class="radio-input">
		<Radio bind:value={syncUnknownUsers}/>
		<p>{$t('mellow.server.settings.roblox.global.sync_unknown_users')}</p>
	</div>

	<RequestErrorUI data={error} background="var(--background-primary)"/>
</div>

<UnsavedChanges
	show={defaultNickname !== data.default_nickname || syncUnknownUsers !== data.sync_unknown_users || allowForcedSyncing !== data.allow_forced_syncing}
	error={error ? $t(`request_error.${error.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

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
		.radio-input {
			display: flex;
			margin-top: 8px;
			align-items: center;
			p {
				margin: 0;
				font-size: .9em;
				margin-left: 16px;
			}
		}
	}
</style>