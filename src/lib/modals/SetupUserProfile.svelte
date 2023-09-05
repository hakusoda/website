<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type { LayoutData } from '../../routes/$types';
	import { getDefaultAvatar } from '$lib/util';
	import type { ApiRequestError } from '$lib/types';
	import { uploadAvatar, updateProfile } from '$lib/api';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import RequestError from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Hourglass from '$lib/icons/Hourglass.svelte';
	import WavingHandEmoji from '$lib/icons/WavingHandEmoji.svelte';

	let name = '';
	let state = 0;
	let error: ApiRequestError | null = null;
	let finishing = false;

	let newAvatar: Uint8Array | null = null;
	let newAvatarUri: string | null = null;
	const finish = async () => {
		finishing = !(error = null);
		
		const token = (await $page.data.session)!.access_token;
		if (name) {
			const response = await updateProfile(token, {
				name,
				username: name.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')
			});
			if (!response.success)
				return finishing = !(error = response.error);
		}

		if (newAvatar) {
			const response = await uploadAvatar(token, user.id, newAvatar);
			if (!response.success)
				return finishing = !(error = response.error);
		}

		state++;
	};

	$: user = ($page.data.user as LayoutData['user'])!;
</script>

<Modal autoOpen>
	{#if !state}
		<h1>{$t('modal.setup_profile')}</h1>
		<p class="summary">{$t('modal.setup_profile.summary')}</p>

		<div class="input-row">
			<p class="input-column">
				{$t('profile.name')}
				<TextInput bind:value={name} placeholder={user.username}/>
			</p>
			<p class="input-column">
				{$t('profile.avatar')}
				<AvatarFile
					name={name || user.username}
					image={newAvatarUri ?? getDefaultAvatar(user.id)}
					bind:result={newAvatar}
					bind:resultUri={newAvatarUri}
				/>
			</p>
		</div>

		<RequestError data={error}/>
		<div class="buttons">
			<Button on:click={finish} disabled={finishing}>
				{#if finishing}
					<Hourglass/>
				{:else}
					<Check/>
				{/if}
				{$t('action.continue')}
			</Button>
			<form method="dialog">
				<Button colour="secondary" disabled={finishing}>
					<X/>{$t('action.later')}
				</Button>
			</form>
		</div>
	{:else}
		<div class="header">
			<Avatar id={user.id} src={newAvatarUri} size="md" hover circle/>
			<WavingHandEmoji size={80}/>
		</div>

		<h1>{$t('modal.setup_profile.welcome')}</h1>
		<p class="summary">{$t('modal.setup_profile.welcome.summary', [name])}</p>

		<div class="buttons">
			<Button on:click={() => invalidateAll()}>
				<Check/>{$t('action.acknowledge')}
			</Button>
		</div>
	{/if}
</Modal>

<style lang="scss">
	.header, h1, .summary, .buttons {
		margin-left: auto;
		margin-right: auto;
	}
	.header {
		gap: 48px;
		display: flex;
		position: relative;
		margin-top: 16px;
		align-items: center;
		margin-bottom: 16px;
	}
	.summary {
		color: var(--color-secondary);
		margin-bottom: 16px;
	}
	.input-row {
		gap: 32px;
		margin: 32px 0 16px;
		display: flex;
		.input-column {
			gap: 8px;
			color: var(--color-secondary);
			display: flex;
			font-size: .9em;
			flex-direction: column;
		}
	}
	.buttons {
		gap: 16px;
		display: flex;
		margin-top: 16px;
	}
</style>