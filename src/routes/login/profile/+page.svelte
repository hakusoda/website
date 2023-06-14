<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { RequestError } from '$lib/types';
	import { uploadAvatar, createProfile } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;
	let username = '';

	let error: RequestError | null = null;
	let avatar: string | null = null;
	let creating = false;
	let avatarData: ArrayBuffer | null = null;
	const create = async () => {
		creating = !(error = null);

		const token = data.session!.access_token;
		const response = await createProfile(token, username);
		if (!response.success)
			return creating = !(error = response);

		if (avatarData) {
			const response = await uploadAvatar(token, data.session!.user.id, avatarData);
			if (!response.success)
				return creating = !(error = response);
		}
		goto(`/user/${response.data.username}`);
	};
</script>

<div class="main">
	<h1>{$t('create_profile')}</h1>
	<div class="profile">
		<div class="avatar">
			<Avatar src={avatar} circle/>
		</div>
		<div class="details">
			<p class="field-label">{$t('profile.username')}</p>
			<TextInput bind:value={username} placeholder={$t('create_profile.username')}/>

			<p class="field-label">{$t('profile.avatar')}</p>
			<AvatarFile name={username} bind:result={avatarData} bind:resultUri={avatar}/>

			<div class="buttons">
				<Button on:click={create} disabled={!username || creating}>
					<Check/>{$t('create_profile.finish')}
				</Button>
			</div>
		</div>
		<RequestErrorUI data={error} background="var(--background-primary)"/>
	</div>
</div>

<style lang="scss">
	.main {
		margin: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			margin-bottom: 24px;
		}
		.profile {
			display: flex;
			align-items: center;
			.avatar {
				gap: 24px;
				display: flex;
				align-items: center;
				flex-direction: column;
				p {
					color: var(--color-tertiary);
					font-size: .8em;
				}
			}
			.details {
				margin: 0 48px;
				display: flex;
				flex-direction: column;
				.buttons {
					gap: 16px;
					display: flex;
					margin-top: 24px;
				}
			}
			.field-label {
				color: var(--color-secondary);
				margin: 24px 0 8px;
				font-size: .9em;
				&:first-of-type {
					margin-top: 16px;
				}
			}
		}
	}
</style>