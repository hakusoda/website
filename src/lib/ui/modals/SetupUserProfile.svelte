<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '../localisation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { getDefaultAvatar } from '$lib/shared/util';
	import type { ApiRequestError } from '$lib/shared/types';
	import { update_user_avatar, update_user_profile } from '$lib/client/api';

	import Modal from '../components/Modal.svelte';
	import Avatar from '../components/Avatar.svelte';
	import AvatarFile from '../components/AvatarFile.svelte';
	import PageSlider from '../components/PageSlider.svelte';
	import RequestError from '../components/RequestError.svelte';

	import X from 'virtual:icons/bi/x-lg';

	$: user = $page.data.user!;

	let name = '';
	let state = false;
	let error: ApiRequestError | null = null;
	let finishing = false;

	let new_avatar: Uint8Array | null = null;
	let new_avatar_url: string | null = null;
	const finish_setup = async () => {
		finishing = !(error = null);
		
		const name2 = name || user.username;
		const response = await update_user_profile({
			name: name2,
			username: name2.toLowerCase().replace(/ /g, '_').replace(/\W/g, '')
		});
		if (!response.success)
			return finishing = !(error = response.error);

		if (new_avatar) {
			const response = await update_user_avatar(user.id, new_avatar);
			if (!response.success)
				return finishing = !(error = response.error);
		}

		state = true;
	};

	$: avatar_url = new_avatar_url || user?.avatar_url || getDefaultAvatar(user?.id);
</script>

<Modal autoOpen>
	<PageSlider position={state ? 1 : 0}>
		<div class="content">
			<div class="input_row">
				<div>
					<p>{$t('profile.name')}</p>
					<TextInput bind:value={name} placeholder={user.name || user.username}/>
				</div>
				<div>
					<p>{$t('profile.avatar')}</p>
					<AvatarFile
						name={name || user.username}
						image={avatar_url}
						bind:result={new_avatar}
						bind:resultUri={new_avatar_url}
					/>
				</div>
				<form method="dialog">
					<button class="top_button">
						<X/>
					</button>
				</form>
			</div>
	
			<RequestError data={error}/>
		</div>
		<div class="content welcome">
			<div class="user" style={`--b: url("${avatar_url}");`}>
				<Avatar id={user.id} src={avatar_url} size="md" circle transparent/>
				<div>
					<h2>{name || user.name || user.username}</h2>
					<p>joined the community {$t('days_ago', [user.created_at])}!</p>
				</div>
			</div>
		</div>
	</PageSlider>
	<div class="footer">
		{#if state}
			<div>
				<h2>{$t('modal.setup_profile.welcome')}</h2>
				<p>{$t('modal.setup_profile.welcome.summary')}</p>
			</div>
			<button on:click={invalidateAll}>
				{$t('action.confirm')}
			</button>
		{:else}
			<div>
				<h2>{$t('modal.setup_profile')}</h2>
				<p>{$t('modal.setup_profile.summary')}</p>
			</div>
			<button on:click={finish_setup} disabled={finishing}>
				{$t('action.continue')}
			</button>
		{/if}
	</div>
</Modal>

<style lang="scss">
	.welcome {
		height: 160px;
		display: flex;
		.user {
			gap: 32px;
			margin: auto;
			display: flex;
			position: relative;
			align-items: center;
			h2 {
				margin: 0;
				font-size: 2em;
				font-weight: 650;
			}
			p {
				margin: 0;
				mix-blend-mode: overlay;
			}
			&:before {
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				filter: blur(64px);
				z-index: -1;
				content: '';
				position: absolute;
				background: var(--b);
				background-size: 100% 100%;
			}
		}
	}
	.content {
		.input_row {
			gap: 32px;
			display: flex;
			div {
				gap: 8px;
				display: flex;
				flex-direction: column;
				p {
					margin: 0;
					font-size: .9em;
					font-weight: 450;
				}
			}
		}
	}
</style>