<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { goto } from '$app/navigation';
	import { RequestErrorType } from '$lib/shared/enums';
	import type { RequestError } from '$lib/shared/types';
	import { updateTeam, update_team_avatar } from '$lib/client/api';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	import Markdown from '$lib/ui/components/Markdown.svelte';
	import AvatarFile from '$lib/ui/components/AvatarFile.svelte';
	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';
	import SegmentedControl from '$lib/ui/components/SegmentedControl.svelte';

	import PersonFill from 'virtual:icons/bi/person-fill';
	export let data;

	let error: RequestError | null = null;
	let saving = false;

	let bio = data.bio ?? '';
	let name = data.name;
	let websiteUrl = data.website_url ?? '';
	let displayName = data.display_name;
	$: name = name.slice(0, 20).toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
	
	let bioEdit = true;

	let newAvatar: Uint8Array | null = null;
	let newAvatarUri: string | null = null;

	const save = async () => {
		if (name.length < 3)
			return error = { error: RequestErrorType.NameTooShort } satisfies RequestError;
		saving = !(error = null);
		
		const response = await updateTeam(data.id, {
			bio: bio === data.bio ? undefined : bio || null,
			name: name === data.name ? undefined : name,
			website_url: websiteUrl === data.website_url ? undefined : websiteUrl || null,
			display_name: displayName === data.display_name ? undefined : displayName
		});
		if (response.success) {
			if (newAvatar)
				await update_team_avatar(data.id, newAvatar);
			return goto(`/team/${name}/settings/profile`, {
				invalidateAll: true
			}).then(() => (saving = false, newAvatar = null, newAvatarUri = null));
		}

		saving = !(error = response);
	};
	const reset = () => (bio = data.bio ?? '', name = data.name, websiteUrl = data.website_url ?? '', displayName = data.display_name, newAvatar = null, newAvatarUri = null, error = null);
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('team.settings.profile.header')}</h1>
	</div>
</div>
<div class="geist">
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
	
	<SegmentedControl title={$t('profile.bio')} bind:value={bioEdit}>
		<svelte:fragment slot="true">
			{$t('action.edit')}
		</svelte:fragment>
		<svelte:fragment slot="false">
			{$t('action.preview')}
		</svelte:fragment>
	</SegmentedControl>
	{#if bioEdit}
		<TextInput bind:value={bio} multiline placeholder={$t('profile.bio.empty.team')}/>
	{:else}
		<div class="bio-preview">
			<Markdown source={bio}/>
		</div>
	{/if}
	
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
</div>

<UnsavedChanges
	show={bio !== (data.bio ?? '') || name !== data.name || displayName !== data.display_name || websiteUrl !== (data.website_url ?? '') || !!newAvatar}
	error={error ? $t(`request_error.${error.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

<style lang="scss">
	.profile {
		padding: 16px;
		position: relative;
		margin-top: 64px;
		background: var(--background-secondary);
		border-radius: 36px;
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
			margin: 32px 8px 4px;
			font-size: .9em;
		}
	}
	.input-row {
		gap: 16px;
		margin: 0 0 32px;
		display: flex;
	}
	.input-label {
		color: var(--color-secondary);
		margin: 32px 0 8px;
		font-size: .9em;
	}
	.bio-preview {
		padding: 20px 24px;
		background: var(--background-secondary);
		border-radius: 16px;
	}
	:global(.text-input) {
		width: 100%;
	}
	.buttons {
		gap: 16px;
		display: flex;
	}
</style>