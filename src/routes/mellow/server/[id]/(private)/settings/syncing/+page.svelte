<script lang="ts">
	import { Button, Select } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { ApiRequestError } from '$lib/shared/types';
	import { API_BASE, USER_CONNECTION_METADATA } from '$lib/shared/constants';
	import { updateMellowServerProfileSyncingSettings } from '$lib/client/api';
	import { UserConnectionType, MellowDefaultNickname } from '$lib/shared/enums';

	import Radio from '$lib/ui/components/Radio.svelte';
	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';

	import Patreon from '$lib/ui/icons/Patreon.svelte';
	import RobloxIcon from '$lib/ui/icons/RobloxIcon.svelte';
	export let data;

	let error: ApiRequestError | null = null;
	let saving = false;
	let defaultNickname = data.default_nickname;
	let skipOnboardingTo = data.skip_onboarding_to;
	let allowForcedSyncing = data.allow_forced_syncing;
	const reset = () => (defaultNickname = data.default_nickname, skipOnboardingTo = data.skip_onboarding_to, allowForcedSyncing = data.allow_forced_syncing);
	$: if (data)
		reset();

	const save = async () => {
		saving = !(error = null);
		const response = await updateMellowServerProfileSyncingSettings($page.params.id, {
			default_nickname: defaultNickname === data.default_nickname ? undefined : defaultNickname,
			skip_onboarding_to: skipOnboardingTo === data.skip_onboarding_to ? undefined : skipOnboardingTo,
			allow_forced_syncing: allowForcedSyncing === data.allow_forced_syncing ? undefined : allowForcedSyncing
		});
		if (response.success)
			return invalidateAll().then(() => saving = false);
		saving = !(error = response);
	};
	
	$: patreon_connected = data.oauth_authorisations.some(item => item.kind === 0);
</script>

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

<p class="input-label">{$t('mellow.server.settings.syncing.settings.skip_onboarding')}</p>
<Select.Root bind:value={skipOnboardingTo}>
	<Select.Item value={null}>
		{$t('mellow.server.settings.syncing.settings.skip_onboarding.default')}
	</Select.Item>
	{#each Object.values(UserConnectionType) as item}
		{#if typeof item === 'number' && item}
			<Select.Item value={item}>
				<svelte:component this={USER_CONNECTION_METADATA[item]?.icon}/>
				{$t('mellow.server.settings.syncing.settings.skip_onboarding.connect', [$t(`user_connection.type.${item}`)])}
			</Select.Item>
		{/if}
	{/each}
</Select.Root>

<p class="input-label">{$t('mellow.server.settings.syncing.settings.auto_sync')}</p>
<p class="summary">{$t('mellow.server.settings.syncing.settings.auto_sync.summary')}</p>
<Button href={patreon_connected ? undefined : `https://www.patreon.com/oauth2/authorize?client_id=BaKp_8PIeBxx0cfJoEEaVxVQMxD3c_IUFS_qCSu5gNFnXLL5c4Qw4YMPtgMJG-n9&redirect_uri=${encodeURIComponent(`${API_BASE}/mellow/service_callback/0`)}&scope=campaigns%20w:campaigns.webhook&response_type=code&state=${$page.params.id}`} disabled={patreon_connected}>
	<Patreon/>{$t('mellow.server.settings.syncing.settings.auto_sync.patreon')}
</Button>

<p class="input-label">{$t('mellow.server.settings.syncing.settings.other')}</p>
<div class="radio-input">
	<Radio bind:value={allowForcedSyncing}/>
	<p>{$t('mellow.server.settings.syncing.settings.allow_forced_syncing')}</p>
</div>

<UnsavedChanges
	show={defaultNickname !== data.default_nickname || skipOnboardingTo !== data.skip_onboarding_to || allowForcedSyncing !== data.allow_forced_syncing}
	error={error ? $t(`request_error.${error.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

<style lang="scss">
	.input-label:first-child {
		margin-top: 0;
	}
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
</style>