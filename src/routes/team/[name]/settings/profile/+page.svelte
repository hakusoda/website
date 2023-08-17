<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';
	import { updateTeam, uploadTeamAvatar } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';

	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;

	let bio = data.bio;
	let name = data.name;
	let websiteUrl = data.website_url;
	let displayName = data.display_name;
	$: name = name.slice(0, 20).toLowerCase().replace(/ /g, '_').replace(/\W/g, '');

	let newAvatar: Uint8Array | null = null;
	let newAvatarUri: string | null = null;

	const save = async () => {
		if (name.length < 3)
			return error = { error: RequestErrorType.NameTooShort } satisfies RequestError;
		saving = !(error = null);
		
		const response = await updateTeam(data.session!.access_token, data.id, {
			bio: bio === data.bio ? undefined : bio || null,
			name: name === data.name ? undefined : name,
			website_url: websiteUrl === data.website_url ? undefined : websiteUrl || null,
			display_name: displayName === data.display_name ? undefined : displayName
		});
		if (response.success) {
			if (newAvatar)
				await uploadTeamAvatar(data.session!.access_token, data.id, newAvatar);
			return goto(`/team/${name}/settings/profile`, {
				invalidateAll: true
			}).then(() => (saving = false, newAvatar = null, newAvatarUri = null));
		}

		saving = !(error = response);
	};
	const reset = () => (bio = data.bio, name = data.name, websiteUrl = data.website_url, displayName = data.display_name, newAvatar = null, newAvatarUri = null, error = null);
</script>

<div class="main">
	<h1>{$t('team.settings.profile.header')}</h1>
	<div class="profile">
		<div class="header">
			<Avatar src={newAvatarUri ?? data.avatar_url} size="md" hover/>
			<div class="name">
				<h1>{displayName}</h1>
				<p>@{name}</p>
			</div>
			<div class="buttons">
				<Button href={`/team/${data.name}`}>
					<PersonFill/>{$t('action.view_profile')}
				</Button>
			</div>
		</div>
		<p class="details">{$t('team.created.false', [data.created_at])}</p>
	</div>

	<div class="input-row">
		<div>
			<p class="input-label">{$t('team.settings.profile.display_name')}</p>
			<TextInput bind:value={displayName}/>
		</div>
		<div>
			<p class="input-label">{$t('team.settings.profile.name')}</p>
			<TextInput bind:value={name}/>
		</div>
	</div>

	<p class="input-label">{$t('profile.bio')}</p>
	<TextInput bind:value={bio} multiline placeholder={$t('profile.bio.empty.team')}/>

	<p class="input-label">{$t('team.settings.profile.website_url')}</p>
	<TextInput bind:value={websiteUrl} placeholder="https://example.com"/>

	<p class="input-label">{$t('profile.avatar')}</p>
	<AvatarFile
		name={displayName}
		image={data.avatar_url}
		circle={false}
		bind:result={newAvatar}
		bind:resultUri={newAvatarUri}
	/>

	<UnsavedChanges
		show={bio !== (data.bio ?? '') || name !== data.name || displayName !== data.display_name || websiteUrl !== (data.website_url ?? '') || !!newAvatar}
		error={error ? $t(`request_error.${error.error}`) : ''}
		{save}
		{reset}
		{saving}
	/>
</div>

<style lang="scss">
	.main {
		width: 100%;
		padding: 32px 128px 32px 64px;
		overflow: auto;
		.profile {
			padding: 16px;
			position: relative;
			margin-top: 64px;
			background: var(--background-secondary);
			border-radius: 16px;
			.header {
				display: flex;
				padding: 0 0 0 128px;
				:global(.avatar) {
					top: -32px;
					left: 24px;
					position: absolute;
				}
				.name {
					h1 {
						margin: 0;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.buttons {
					margin-left: auto;
				}
			}
			.details {
				color: var(--color-secondary);
				margin: 24px 0 0;
				font-size: .9em;
			}
		}
		.input-row {
			gap: 16px;
			display: flex;
		}
		.input-label {
			color: var(--color-secondary);
			margin: 32px 0 8px;
			font-size: .9em;
		}
		:global(.text-input) {
			width: 100%;
		}
		.buttons {
			gap: 16px;
			display: flex;
		}
	}
</style>