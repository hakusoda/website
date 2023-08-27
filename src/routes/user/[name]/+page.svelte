<script lang="ts">
	import MediaQuery from 'svelte-media-queries';
	import { Tabs, Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { hasBit, getDefaultAvatar } from '$lib/util';
	import type { RequestError, ApiRequestError } from '$lib/types';
	import { TeamFlag, UserFlags, RequestErrorType } from '$lib/enums';
	import { uploadAvatar, updateProfile, createUserPost, createTeamInvite, uploadPostAttachments } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';

	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';
	import SetupUserProfile from '$lib/modals/SetupUserProfile.svelte';

	import X from '$lib/icons/X.svelte';
	import Chat from '$lib/icons/Chat.svelte';
	import Star from '$lib/icons/Star.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import Heart from '$lib/icons/Heart.svelte';
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

	$: avatar = data.avatar_url || getDefaultAvatar(data.id);

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

	let creatingPost = false;
	let createPostError: ApiRequestError | null = null;
	let createPostContent = '';
	let createPostAttachments: [string, ArrayBuffer, string][] = [];
	
	const createPost = async () => {
		creatingPost = !(createPostError = null);

		const attachments = createPostAttachments.length ? await uploadPostAttachments(createPostAttachments.map(item => [item[1], item[2]])) : [];
		const response = await createUserPost(data.session!.access_token, data.user!.id, {
			content: createPostContent,
			attachments
		});

		creatingPost = false;
		if (!response.success)
			return createPostError = response;

		const zero: [{ count: number }] = [{ count: 0 }];
		data.posts = [{ ...response.data, likes: zero, comments: zero }, ...data.posts];
		createPostContent = '';
		createPostAttachments = [];
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

<svelte:window on:paste={async event => {
	if (createPostAttachments.length < 2) {
		const files = event.clipboardData?.files;
		if (files)
			for (const file of Array.from(files))
				createPostAttachments = [...createPostAttachments, [URL.createObjectURL(file), await file.arrayBuffer(), file.type]];
	}
}}/>

<div class="main">
	<div class="card-container">
		<div class="card">
			<div class="header">
				<MediaQuery query="(min-width: 512px)" let:matches>
					<Avatar src={newAvatarUri ?? avatar} size={matches ? 'lg' : 'md'} hover circle/>
				</MediaQuery>
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
					<Markdown source={data.bio}/>
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
				<AvatarFile name={data.name ?? data.username} image={avatar} bind:result={newAvatar} bind:resultUri={newAvatarUri}/>
	
				<div class="edit-buttons">
					<Button on:click={() => editing = false} disabled={saving}>
						<X/>{$t('action.cancel')}
					</Button>
				</div>
			{/if}
		</div>
	</div>
	<Tabs.Root value={0}>
		<Tabs.Item title={$t('profile.posts', [data.posts.length])} value={0}>
			<div class="posts">
				{#if data.session && data.id === data.session.user.id}
					<div class="create">
						<TextInput bind:value={createPostContent} multiline placeholder={$t('profile.posts.create.placeholder')}/>
						<Button on:click={createPost} disabled={creatingPost}>
							<Plus/>{$t('profile.posts.create')}
						</Button>
					</div>
					<div class="create-attachments">
						{#each createPostAttachments as image}
							<div>
								<img src={image[0]} alt=""/>
								<button type="button" on:click={() => createPostAttachments = createPostAttachments.filter(item => item !== image)}>
									<Trash/>
								</button>
							</div>
						{/each}
					</div>
					<RequestErrorUI data={createPostError} background="var(--background-primary)"/>
				{/if}
				{#each data.posts as item}
					<a class="item" href={`/user/${data.username}/post/${item.id}`}>
						<div class="header">
							<Avatar src={avatar} size="xs" circle/>
							<p class="author">
								<a href={`/user/${data.username}`}>
									{data.name ?? `@${data.username}`}
								</a>
								{$t('profile_post.posted', [item.created_at])}
							</p>
						</div>
						<Markdown source={item.content}/>
						{#if item.attachments.length}
							<div class="attachments">
								{#each item.attachments as attachment}
									<img src={attachment.url} alt=""/>
								{/each}
							</div>
						{/if}
						<div class="details">
							<p>
								<Chat/>{$t('number', [item.comments[0].count])}
							</p>
							<p>
								<Heart/>{$t('number', [item.likes[0].count])}
							</p>
						</div>
					</a>
				{/each}
			</div>
		</Tabs.Item>
		{#if data.teams.length}
			<Tabs.Item title={$t('profile.teams', [data.teams.length])} value={1}>
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
								<div>
									<PersonFill size={14}/>
									<p>{item.role?.name ?? $t('team_role.unknown')}</p>
								</div>
								<div>
									<StarFill size={14}/>
									{#if item.owner}
										<a href={`/user/${item.owner.username}`}>
											{item.owner.name || item.owner.username}
										</a>
									{:else}
										<p>{$t('team.owner.none')}</p>
									{/if}
								</div>
								<div>
									<PeopleFill size={14}/>
									<p>{$t('members', [item.members[0].count])}</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</Tabs.Item>
		{/if}
	</Tabs.Root>
</div>

<UnsavedChanges
	show={data.user?.id === data.id && (editName !== (data.name ?? data.username) || editBio !== (data.bio ?? '') || !!newAvatar)}
	error={saveError ? $t(`request_error.${saveError.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

{#if !data.is_edited}
	<SetupUserProfile/>
{/if}

<svelte:head>
	<title>{data.name ?? data.username}</title>
	<meta content={`${data.name ?? data.username} (@${data.username})`} property="og:title">
	<meta content={data.bio} property="og:description">
	<meta content={avatar} property="og:image">
	<meta name="og:type" content="profile">
	<meta property="profile:username" content={data.username}>
</svelte:head>

<style lang="scss">
	.main {
		gap: 32px;
		margin: 128px 32px;
		display: flex;
		flex-wrap: wrap;
		@media (max-width: 512px) {
			margin: 120px 0;
		}
		.card-container {
			width: 480px;
			display: flex;
			position: relative;
			min-width: 480px;
			margin-left: auto;
			.card {
				height: fit-content;
				display: flex;
				padding: 24px;
				overflow: hidden;
				background: var(--background-secondary);
				padding-top: 32px;
				border-radius: 16px;
				flex-direction: column;
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
					@media (max-width: 512px) {
						top: -80px;
					}
				}
				.buttons {
					gap: 8px;
					display: flex;
					align-items: end;
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
					display: flex;
					align-items: end;
					&:not(:last-child) {
						margin-bottom: 12px;
					}
					p {
						color: var(--color-tertiary);
						margin: 0;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis;
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
			@media (max-width: 512px) {
				width: 100%;
				min-width: unset;
				.card {
					padding-top: 8px;
					border-radius: 0;
				}
			}
		}
		:global(.tabs-container) {
			flex: 1 1 40%;
			max-width: 640px;
			margin-right: auto;
		}
		.posts {
			gap: 16px;
			display: flex;
			flex-direction: column;
			.create {
				gap: 16px;
				display: flex;
				:global(.text-input) {
					width: 100%;
				}
			}
			.create-attachments {
				gap: 16px;
				display: flex;
				div {
					width: 128px;
					height: 128px;
					position: relative;
					img {
						width: 100%;
						height: 100%;
						object-fit: cover;
						border-radius: 8px;
					}
					button {
						top: 8px;
						right: 8px;
						color: var(--color-primary);
						border: none;
						cursor: pointer;
						opacity: 0;
						padding: 6px;
						display: flex;
						position: absolute;
						background: var(--background-tertiary);
						border-radius: 4px;
						&:hover {
							background: #914343;
						}
					}
					&:hover button {
						opacity: 1
					}
				}
			}
			.item {
				padding: 16px;
				background: var(--background-secondary);
				border-radius: 16px;
				text-decoration: none;
				.header {
					margin: 0 0 12px;
					display: flex;
					align-items: center;
					.author {
						color: var(--color-secondary);
						margin: 0;
						font-size: .95em;
						margin-left: 12px;
					}
				}
				.attachments {
					gap: 16px;
					width: 100%;
					margin: 24px 0 0;
					display: flex;
					overflow: hidden;
					img {
						flex: 1 0 0;
						width: 0;
						border-radius: 8px;
					}
				}
				.details {
					gap: 16px;
					margin: 24px 0 0;
					display: flex;
					p {
						gap: 8px;
						color: var(--color-secondary);
						margin: 0;
						cursor: pointer;
						display: flex;
						font-size: .9em;
						align-items: center;
						&:hover {
							color: var(--color-primary);
						}
					}
				}
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
				@media (max-width: 512px) {
					border-radius: 0;
				}
			}
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
					div {
						gap: 6px;
						color: var(--color-secondary);
						height: fit-content;
						display: flex;
						padding: 4px 8px;
						overflow: hidden;
						font-size: .75em;
						box-shadow: 0 0 0 1px var(--border-secondary);
						white-space: nowrap;
						align-items: center;
						border-radius: 16px;
						p {
							margin: 0;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						a {
							padding: 0;
							overflow: hidden;
							text-overflow: ellipsis;
						}
						:global(svg) {
							min-width: 14px;
						}
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