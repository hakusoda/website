<script lang="ts">
	import { Tabs, Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import type { RequestError } from '$lib/types';
	import { TeamFlag, UserFlags, RequestErrorType } from '$lib/enums';
	import { uploadAvatar, updateProfile, createTeamInvite } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	import X from '$lib/icons/X.svelte';
	import Star from '$lib/icons/Star.svelte';
	import Burger from '$lib/icons/Burger.svelte';
	import Person from '$lib/icons/Person.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import StarFill from '$lib/icons/StarFill.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import PatchCheckFill from '$lib/icons/PatchCheckFill.svelte';
	import EnvelopePlusFill from '$lib/icons/EnvelopePlusFill.svelte';
	import ClipboardPlusFill from '$lib/icons/ClipboardPlusFill.svelte';
	import ThreeDotsVertical from '$lib/icons/ThreeDotsVertical.svelte';
	export let data: PageData;

	let saving = false;
	let bioEdit = true;
	let editing = false;
	let editBio = data.bio || '';
	let editName = data.name || data.username;
	let saveError: RequestError | null = null;
	$: editChanged = editName !== (data.name || data.username) || editBio !== data.bio;
	$: if (!editing)
		editBio = data.bio || '', editName = data.name || data.username, newAvatar = null, newAvatarUri = null;
	else
		editBio = editBio.slice(0, 200), editName = editName.slice(0, 20);

	const save = async () => {
		if (editName.length < 3)
			return saveError = { error: RequestErrorType.NameTooShort };
		saving = !(saveError = null);

		if (editChanged) {
			const response = await updateProfile(data.session!.access_token, {
				bio: editBio === data.bio ? undefined : editBio.length ? editBio : null,
				name: editName === (data.name || data.username) ? undefined : editName.length ? editName : null
			});
			if (response.success) {
				if (newAvatar)
					uploadAvatar2();
				else
					location.reload();
			} else
				saving = !(saveError = response);
		} else if (newAvatar)
			uploadAvatar2();
	};
	const reset = () => (editBio = data.bio || '', editName = data.name || data.username, newAvatar = null, newAvatarUri = null, saveError = null);

	let newAvatar: ArrayBuffer | null = null;
	let newAvatarUri: string | null = null;
	const uploadAvatar2 = () => uploadAvatar(data.session!.access_token!, data.id, newAvatar!).then(response => {
		if (response.success)
			location.reload();
		else
			saving = !(saveError = response);
	});

	let burgering = false;
	const burger = async () => {
		burgering = true;
		const response = await fetch('?/burger', {
			body: '',
			method: 'POST'
		});
		const result = deserialize(await response.text());
		if (result.type === 'success')
			location.reload();
		else if (result.type === 'failure')
			burgering = false;
	};

	let dropdownTrigger: () => void;

	const inviteToTeam = async (teamId: string) => {
		const result = await createTeamInvite(data.session!.access_token, teamId, data.id);
		if (result.success)
			location.reload();
		else
			alert($t(`request_error.${result.error as 0}`));
	};
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar id={data.id} src={newAvatarUri ?? data.avatar_url} hover circle/>
			<div class="name">
				<h1>{editName || data.username}</h1>
				<p>@{data.username}</p>
			</div>
		</div>
		{#if !editing}
			<div class="buttons">
				<div class="roles">
					{#each Object.values(UserFlags) as flag}
						{#if typeof flag === 'number' && flag && (data.flags & flag) === flag}
							<p class="role"><StarFill/>{$t(`user_role.${flag}`)}</p>
						{/if}
					{/each}
				</div>
				{#if data.id === data.user?.id}
					<Button on:click={() => editing = true}>
						<PencilFill/>{$t('action.edit_profile')}
					</Button>
				{:else if data.session}
					<Button on:click={burger} disabled={burgering || data.burger.length} title={$t(`profile.burger.${!!data.burger.length}`)}>
						<Burger/>
					</Button>
				{/if}
				<DropdownMenu.Root bind:trigger={dropdownTrigger}>
					<Button slot="trigger" on:click={dropdownTrigger}>
						<ThreeDotsVertical/>
					</Button>
					<p>{data.name || data.username} (@{data.username})</p>
					{#if data.session && data.id !== data.session.user.id}
						<DropdownMenu.Sub>
							<svelte:fragment slot="trigger">
								<EnvelopePlusFill/>{$t('action.invite_team')}
							</svelte:fragment>

							<p>{$t('profile.invite')}</p>
							{#each data.my_teams as item}
								<button type="button" on:click={() => inviteToTeam(item.id)}>
									<Avatar src={item.avatar_url} size="xxs" transparent/>
									{item.display_name}
								</button>
							{/each}
						</DropdownMenu.Sub>
						<div class="separator"/>
					{/if}
					<button type="button" on:click={() => navigator.clipboard.writeText(data.id)}>
						<ClipboardPlusFill/>{$t('action.copy_id')}
					</button>
				</DropdownMenu.Root>
			</div>
			{#if data.bio}
				<div class="separator"/>
				<Markdown source={data.bio.replace(/https:\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g, url => `[${url.substring(8)}](${url})`)}/>
			{/if}
			<div class="separator"/>
			<div class="detail">
				<Sunrise/>
				<p>{$t('profile.joined', [data.created_at])}</p>
			</div>
			{#if data.roblox_links.length}
				<div class="separator"/>
				<div class="detail">
					<Person/>
					<p>{$t('profile.roblox')}</p>
				</div>
				<div class="roblox">
					{#each data.roblox_users as item}
						<a href={`https://roblox.com/users/${item.id}/profile`} target="_blank">
							<Avatar src={item.icon.imageUrl} size="xxs" circle/>
							{item.displayName}
						</a>
					{/each}
				</div>
			{/if}
			<div class="separator"/>
			<div class="detail">
				<Star/>
				<p>{$t('profile.id', [data.id])}</p>
			</div>
		{:else}
			<p class="field-label">{$t('profile.name')}</p>
			<TextInput bind:value={editName} placeholder={data.username}/>

			<SegmentedControl title={$t('profile.bio')} bind:value={bioEdit}>
				<svelte:fragment slot="true">
					{$t('action.edit')}
				</svelte:fragment>
				<svelte:fragment slot="false">
					{$t('action.preview')}
				</svelte:fragment>
			</SegmentedControl>
			{#if bioEdit}
				<TextInput bind:value={editBio} multiline placeholder={$t('profile.bio.empty')}/>
			{:else}
				<Markdown source={editBio}/>
			{/if}

			<p class="field-label">{$t('profile.avatar')}</p>
			<AvatarFile name={data.name ?? data.username} image={data.avatar_url} bind:result={newAvatar} bind:resultUri={newAvatarUri}/>

			<div class="edit-buttons">
				<Button on:click={() => editing = false} disabled={saving}>
					<X/>
					{$t('action.cancel')}
				</Button>
			</div>
		{/if}
	</div>
	{#if data.teams.length}
		<Tabs.Root value={0}>
			<Tabs.Item title={$t('profile.teams', [data.teams.length])} value={0}>
				<div class="teams">
					{#each data.teams as item}
						<a href={`/team/${item.name}`}>
							<div class="header">
								<Avatar src={item.avatar_url} size="sm" transparent/>
								<div class="name">
									<h1 title={item.display_name}>
										{item.display_name}
										{#if hasBit(item.flags, TeamFlag.Verified)}
											<PatchCheckFill/>
										{/if}
									</h1>
									<p>@{item.name}</p>
								</div>
							</div>
							<div class="details">
								<p>
									<PersonFill size={14}/>
									{item.role?.name ?? $t('team_role.unknown')}
								</p>
								<p>
									<StarFill size={14}/>
									{#if item.owner}
										<a href={`/user/${item.owner.username}`}>
											{item.owner.name || item.owner.username}
										</a>
									{:else}
										{$t('team.owner.none')}
									{/if}
								</p>
								<p>
									<PeopleFill size={14}/>
									{$t('members', [item.members[0].count])}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</Tabs.Item>
		</Tabs.Root>
	{/if}
</div>

<UnsavedChanges
	show={data.user?.id === data.id && (editName !== data.name || editBio !== data.bio || !!newAvatar)}
	error={saveError ? $t(`request_error.${saveError.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

<svelte:head>
	<title>{data.name ?? data.username}</title>
	<meta content={`${data.name ?? data.username} (@${data.username})`} property="og:title">
	<meta content={data.bio} property="og:description">
	<meta content={data.avatar_url} property="og:image">
	<meta name="og:type" content="profile">
	<meta property="profile:username" content={data.username}>
</svelte:head>

<style lang="scss">
	.main {
		gap: 32px;
		margin: 128px 32px 16px;
		display: flex;
		flex-wrap: wrap;
		.card {
			width: 416px;
			height: fit-content;
			padding: 24px;
			position: relative;
			min-width: 416px;
			background: var(--background-secondary);
			padding-top: 32px;
			border-radius: 16px;
			.header {
				gap: 32px;
				top: -96px;
				display: flex;
				position: absolute;
				align-items: center;
				.name {
					margin-bottom: 16px;
					h1 {
						width: max-content;
						margin: 0;
						font-size: 2.5em;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
					}
				}
			}
			.buttons {
				gap: 8px;
				display: flex;
				justify-content: end;
				.roles {
					gap: 16px;
					height: auto;
					display: flex;
					margin-top: 24px;
					align-items: end;
					margin-right: auto;
					.role {
						gap: 8px;
						color: hsl(260 80% 80%);
						margin: 0;
						display: flex;
						font-weight: 500;
						align-items: center;
					}
				}
			}
			.edit-buttons {
				gap: 16px;
				display: flex;
				margin-top: 16px;
			}
			.field-label {
				color: var(--color-secondary);
				margin: 24px 0 8px;
				font-size: .9em;
				&:first-of-type {
					margin-top: 16px;
				}
			}
			:global(.segmented-control) {
				margin: 32px 0 8px;
			}
			:global(.text-input) {
				width: 100%;
			}
			:global(.text-input[contenteditable]) {
				height: 128px;
				overflow: auto;
				max-height: 128px;
			}
			& > .separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.detail {
				gap: 8px;
				width: fit-content;
				display: flex;
				position: relative;
				align-items: end;
				margin-bottom: 12px;
				p {
					color: var(--color-tertiary);
					margin: 0;
					white-space: nowrap;
				}
			}
			.roblox {
				gap: 8px;
				display: flex;
				a {
					gap: 8px;
					width: fit-content;
					margin: 0;
					display: flex;
					padding: 4px 12px 4px 4px;
					font-size: .9em;
					background: var(--background-tertiary);
					align-items: center;
					border-radius: 24px;
				}
			}
		}
		:global(.tabs-container) {
			flex: 1 1 40%;
		}
		.teams {
			gap: 16px;
			display: flex;
			flex-wrap: wrap;
			& > a {
				flex: 1 1 calc(50% - 64px);
				display: flex;
				padding: 16px;
				overflow: hidden;
				background: var(--background-secondary);
				border-radius: 16px;
				flex-direction: column;
				text-decoration: none;
				.header {
					display: flex;
					align-items: center;
					.name {
						width: 100%;
						display: flex;
						overflow: hidden;
						margin-left: 16px;
						flex-direction: column;
						h1 {
							margin: 0;
							overflow: hidden;
							max-width: 100%;
							font-size: 1.25em;
							font-weight: 600;
							white-space: nowrap;
							text-overflow: ellipsis;
							:global(svg) {
								color: var(--color-verified);
								margin-left: 2px;
							}
						}
						p {
							color: var(--color-secondary);
							margin: 2px 0 0;
							font-size: .8em;
							line-height: normal;
						}
					}
				}
				.details {
					gap: 8px;
					height: fit-content;
					margin: 16px 0 0;
					display: flex;
					p {
						gap: 6px;
						color: var(--color-secondary);
						margin: 0;
						display: flex;
						padding: 4px 8px;
						font-size: .75em;
						box-shadow: 0 0 0 1px var(--border-secondary);
						align-items: center;
						border-radius: 16px;
					}
				}
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
	}
	@media (max-width: 512px) {
		.main {
			margin: 128px 0 16px;
			.card {
				width: 100%;
				border-radius: 0;
			}
			:global(.tabs-container .buttons) {
				border-radius: 0 !important;
			}
			.teams a {
				flex: unset;
				width: 100%;
				padding: 12px 16px;
				border-radius: 0;
			}
		}
	}
</style>