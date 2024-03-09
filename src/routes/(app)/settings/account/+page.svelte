<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { update_user_profile } from '$lib/client/api';
	import { invalidateAll } from '$app/navigation';
	import { RequestErrorType } from '$lib/shared/enums';
	import type { RequestError } from '$lib/shared/types';

	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';
	export let data;

	let error: RequestError | null = null;
	let saving = false;
	let username = data.user!.username as string;
	const save = async () => {
		if (username.length < 3)
			return error = { error: RequestErrorType.NameTooShort };
		if (username.length > 20)
			return error = { error: RequestErrorType.NameTooLong };
		saving = !(error = null);

		const response = await update_user_profile({ username });
		if (response.success)
			return invalidateAll().then(() => saving = false);
		saving = !(error = response);
	};
	const reset = () => username = data.user!.username;
</script>

<div class="header">
	<h2>{$t('settings.account.username')}</h2>
	<p>{$t('settings.account.username.summary')}</p>
</div>
<TextInput bind:value={username}/>

<div class="header">
	<h2>{$t('settings.account.id')}</h2>
	<p>{$t('settings.account.id.summary')}</p>
</div>
<p class="user-id">{data.user?.id}</p>

<UnsavedChanges
	show={username !== data.user?.username}
	error={error ? $t(`request_error.${error.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

<style lang="scss">
	.header {
		margin-bottom: 24px !important;
		&:not(:first-child) {
			margin-top: 48px;
			border-top: 1px solid var(--border-primary);
			padding-top: 40px;
		}
	}
	.user-id {
		width: fit-content;
		color: var(--color-secondary);
		margin: 0;
		border: 1px solid var(--border-primary);
		padding: 8px 16px;
		font-size: .9em;
		border-radius: 16px;
	}
</style>