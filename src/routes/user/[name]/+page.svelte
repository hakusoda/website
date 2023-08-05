<script lang="ts">
	import { Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { UserFlags } from '$lib/enums';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import type { RequestError } from '$lib/types';
	import { uploadAvatar, createTeamInvite } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import AvatarFile from '$lib/components/AvatarFile.svelte';
	import Description from '$lib/components/Description.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Star from '$lib/icons/Star.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Burger from '$lib/icons/Burger.svelte';
	import Person from '$lib/icons/Person.svelte';
	import People from '$lib/icons/People.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
	import EnvelopePlusFill from '$lib/icons/EnvelopePlusFill.svelte';
	import ClipboardPlusFill from '$lib/icons/ClipboardPlusFill.svelte';
	import ThreeDotsVertical from '$lib/icons/ThreeDotsVertical.svelte';
	export let data: PageData;

	let saving = false;
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
		saving = !(saveError = null);
		if (editChanged) {
			const response = await fetch('?/edit', {
				body: JSON.stringify({
					bio: editBio === data.bio ? undefined : editBio.length ? editBio : null,
					name: editName === (data.name || data.username) ? undefined : editName.length ? editName : null
				}),
				method: 'POST'
			});
			const result = deserialize(await response.text());
			if (result.type === 'success') {
				if (newAvatar)
					uploadAvatar2();
				else
					location.reload();
			} else if (result.type === 'failure')
				saving = !(saveError = result.data as any);
		} else if (newAvatar)
			uploadAvatar2();
	};

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
		await createTeamInvite(data.session!.access_token, teamId, data.id);
		location.reload();
	};
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={newAvatarUri ?? data.avatar_url} hover circle/>
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
							<p class="role"><Voxelified/>{$t(`user_role.${flag}`)}</p>
						{/if}
					{/each}
				</div>
				{#if data.id === data.user?.id}
					<Button on:click={() => editing = true}>
						<PencilFill/>{$t('action.edit_profile')}
					</Button>
				{:else}
					<Button on:click={burger} disabled={burgering || data.burger.length} title={$t(`profile.burger.${!!data.burger.length}`)}>
						<Burger/>
					</Button>
				{/if}
				<DropdownMenu.Root bind:trigger={dropdownTrigger}>
					<Button slot="trigger" on:click={dropdownTrigger}>
						<ThreeDotsVertical/>
					</Button>
					<p>{data.name || data.username} (@{data.username})</p>
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
					<button type="button" on:click={() => navigator.clipboard.writeText(data.id)}>
						<ClipboardPlusFill/>{$t('action.copy_id')}
					</button>
				</DropdownMenu.Root>
			</div>
			{#if data.bio}
				<div class="separator"/>
				<Description value={data.bio}/>
			{/if}
			<div class="separator"/>
			<div class="counter">
				<Sunrise/>
				<p>{$t('profile.joined', [data.created_at])}</p>
			</div>
			{#if data.teams.length}
				<div class="separator"/>
				<div class="counter">
					<People/>
					<p>{$t(`profile.teams.${data.teams.length === 1}`, [data.teams.length])}</p>
				</div>
				<div class="teams">
					{#each data.teams as item}
						<a href={`/team/${item.name}`}>
							<Avatar src={item.avatar_url} size="sm" transparent/>
							<div class="info">
								<div class="name">
									<p class="display">{item.display_name}</p>
									<p class="id">{item.name}</p>
								</div>
								<p class="details">{$t('profile.teams.item.details', [item.members.length, data.name ?? data.username, $t(`team_role.${item.role}.profile`)])}</p>
							</div>
						</a>
					{/each}
				</div>
			{/if}
			{#if data.roblox_links.length}
				<div class="separator"/>
				<div class="counter">
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
			<div class="counter">
				<Star/>
				<p>{$t('profile.id', [data.id])}</p>
			</div>
		{:else}
			<p class="field-label">{$t('profile.name')}</p>
			<TextInput bind:value={editName} placeholder={data.username}/>

			<p class="field-label">{$t('profile.bio')}</p>
			<TextInput bind:value={editBio} multiline placeholder={$t('profile.bio.empty')}/>

			<p class="field-label">{$t('profile.avatar')}</p>
			<AvatarFile name={data.name ?? data.username} image={data.avatar_url} bind:result={newAvatar} bind:resultUri={newAvatarUri}/>

			<RequestErrorUI data={saveError}/>
			<div class="edit-buttons">
				<Button on:click={save} disabled={saving || (!editChanged && !newAvatar)}>
					<Check/>
					{$t('action.save_changes')}
				</Button>
				<Button on:click={() => editing = false} disabled={saving}>
					<X/>
					{$t('action.cancel')}
				</Button>
			</div>
		{/if}
	</div>
</div>

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
		margin: 128px 32px 16px;
		display: flex;
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
						margin: 0;
						margin-top: 4px;
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
						color: #e696ff;
						margin: 0;
						display: flex;
						font-weight: 600;
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
			:global(.text-input) {
				width: 100%;
			}
			:global(.text-input[contenteditable]) {
				height: 128px;
				overflow: auto;
				max-height: 128px;
			}
			.separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.counter {
				gap: 6px;
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
			.teams {
				gap: 8px;
				display: flex;
				flex-direction: column;
				a {
					gap: 16px;
					width: -webkit-fill-available;
					margin: 0;
					display: flex;
					padding: 8px 24px 8px 8px;
					font-size: 1em;
					background: var(--background-tertiary);
					font-weight: 500;
					align-items: center;
					border-radius: 8px;
					text-decoration: none;
					.info {
						.name {
							display: flex;
							align-items: end;
							margin-bottom: 4px;
							.display {
								margin: 0;
							}
							.id {
								color: var(--color-secondary);
								margin: 0;
								opacity: 0.75;
								font-size: .8em;
								font-weight: 500;
								margin-left: 8px;
							}
						}
						.details {
							color: var(--color-secondary);
							margin: 0;
							font-size: .8em;
						}
					}
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
		}
	}
</style>