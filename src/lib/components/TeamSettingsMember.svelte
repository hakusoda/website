<script lang="ts">
	import { Button, DropdownMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { page } from '$app/stores';
	import { hasBit } from '../util';
	import { updateTeamMember } from '../api';
	import { TeamRolePermission } from '../enums';

	import Avatar from './Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import ThreeDots from '../icons/ThreeDots.svelte';
	import PeopleFill from '../icons/PeopleFill.svelte';
	import ClipboardPlusFill from '../icons/ClipboardPlusFill.svelte';
	export let id: string;
	export let name: string | null = null;
	export let role: PartialRole | null = null;
	export let owner: string | null = null;
	export let teamId: string;
	export let avatar: string | null = null;
	export let inviter: {
		id: string
		name: string
		username: string
		avatar_url: string
	} | null = null
	export let isInvite = false;
	export let username: string;
	export let joinedAt: string;

	export let roles: PartialRole[] = [];
	export let myRole: PartialRole | null = null;

	interface PartialRole {
		id: string
		name: string
		position: number
		permissions: number
	}

	let trigger: () => void;
	let changingRole = false;

	$: filteredRoles = role ? roles.filter(item => item.id !== role!.id) : roles;

	const changeRole = async (targetRole: PartialRole | null) => {
		changingRole = true;
		
		const response = await updateTeamMember(teamId, id, {
			role_id: targetRole ? targetRole.id : null
		});
		if (response.success)
			role = targetRole;
		else
			alert($t(`request_error.${response.error as 0}`));

		changingRole = false;
	};
</script>

<div class="team-settings-member">
	<Avatar {id} src={avatar} size="xs" circle/>
	<div class="details">
		<a href={`/user/${username}`}>{name || username}</a>
		<p>
			@{username}
			{#if role}
				• {role.name}
			{/if}
		</p>
	</div>
	<p class="joined">
		{isInvite ? '' : $t('profile.joined', [joinedAt])}{#if inviter}
			{#if !isInvite}, {/if}{$t(isInvite ? 'team_invite.author' : 'team_invite.author2')}
			<a href={`/user/${inviter.username}`}>
				{inviter.name || inviter.username}
			</a>
			{#if isInvite}
				{$t('time_ago', [joinedAt])}
			{/if}
		{/if}
	</p>
	<DropdownMenu.Root bind:trigger>
		<button type="button" class="options" slot="trigger" on:click={trigger}>
			<ThreeDots/>
		</button>
		<p>{name || username} (@{username})</p>
		{#if filteredRoles.length && owner !== id && (owner === $page.data.user?.id || (myRole && hasBit(myRole.permissions, TeamRolePermission.ManageMembers)))}
			<DropdownMenu.Sub>
				<svelte:fragment slot="trigger">
					<PeopleFill/>{$t('action.change_role')}
				</svelte:fragment>
				
				<p>{$t('label.team_roles')}</p>
				{#each filteredRoles as role}
					<button type="button" on:click={() => changeRole(role)}>
						{role.name}
					</button>
				{/each}
				{#if role}
					<div class="separator"/>
					<button type="button" on:click={() => changeRole(null)}>
						<X/>{$t('team_role.unknown')}
					</button>
				{/if}
			</DropdownMenu.Sub>
			<div class="separator"/>
		{/if}
		<button type="button" on:click={() => navigator.clipboard.writeText(id)}>
			<ClipboardPlusFill/>
			{$t('action.copy_id')}
		</button>
	</DropdownMenu.Root>
</div>

<style lang="scss">
	.team-settings-member {
		height: 64px;
		display: flex;
		padding: 0 28px;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 32px;
		.details {
			margin: 0 auto 0 24px;
			a {
				gap: 8px;
				margin: 0;
				display: flex;
				line-height: 1;
				font-weight: 500;
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: .8em;
			}
		}
		.joined {
			color: var(--color-secondary);
			margin: 0 24px;
			font-size: .8em;
		}
		.options {
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 0;
			background: none;
		}
	}
</style>