<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { getDefaultAvatar } from '$lib/shared/util';
	import type { ApiRequestError } from '$lib/shared/types';
	import { update_user_avatar, update_user_profile } from '$lib/client/api';

	import Modal from '$lib/ui/components/Modal.svelte';
	import Avatar from '$lib/ui/components/Avatar.svelte';
	import AvatarFile from '$lib/ui/components/AvatarFile.svelte';
	import RequestError from '$lib/ui/components/RequestError.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import Hourglass from 'virtual:icons/bi/hourglass';
	import WavingHandEmoji from '$lib/ui/icons/WavingHandEmoji.svelte';

	let name = '';
	let state = 0;
	let error: ApiRequestError | null = null;
	let finishing = false;

	let newAvatar: Uint8Array | null = null;
	let newAvatarUri: string | null = null;
	const finish = async () => {
		finishing = !(error = null);
		
		const name2 = name || user.username;
		const response = await update_user_profile({
			name: name2,
			username: name2.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')
		});
		if (!response.success)
			return finishing = !(error = response.error);

		if (newAvatar) {
			const response = await update_user_avatar(user.id, newAvatar);
			if (!response.success)
				return finishing = !(error = response.error);
		}

		state++;
	};

	$: user = $page.data.user!;
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