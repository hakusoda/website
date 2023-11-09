<script lang="ts">
	import { Select } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import type { RequestError } from '$lib/types';
	import { RequestErrorType, MellowDefaultNickname } from '$lib/enums';

	import Radio from '$lib/components/Radio.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import RobloxIcon from '$lib/icons/RobloxIcon.svelte';
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
</script>

<div class="main">
	<p class="input-label">{$t('mellow.server.settings.syncing.settings.nickname')}</p>
	<p class="summary">{$t('mellow.server.settings.syncing.settings.nickname.summary')}</p>
	
	<Select.Root bind:value={defaultNickname}>
		{#each Object.values(MellowDefaultNickname) as item}
			{#if !/^[A-Z]/.test(item)}
				<Select.Item value={item}>
					{#if item}
						<RobloxIcon/>
					{/if}
					{$t(`mellow_default_nickname.${item}`)}
				</Select.Item>
			{/if}
		{/each}
	</Select.Root>

	<p class="input-label">{$t('mellow.server.settings.syncing.settings.other')}</p>
	<div class="radio-input">
		<Radio bind:value={allowForcedSyncing}/>
		<p>{$t('mellow.server.settings.syncing.settings.allow_forced_syncing')}</p>
	</div>
	<div class="radio-input">
		<Radio bind:value={syncUnknownUsers}/>
		<p>{$t('mellow.server.settings.syncing.settings.sync_unknown_users')}</p>
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
		margin: 0 0 32px 64px;
		.summary {
			color: var(--color-tertiary);
			margin: 0 0 16px;
			font-size: .75em;
			white-space: pre;
			line-height: 1.5;
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