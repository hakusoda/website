<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { page } from '$app/stores';
	import { TeamRolePermission } from '../enums';
	import { hasBit, hasOneOfBits } from '../util';
	import { updateTeamMember, removeTeamMember } from '../api';

	import Avatar from './Avatar.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	import BoxArrowLeft from 'virtual:icons/bi/box-arrow-left';
	import ClipboardPlusFill from 'virtual:icons/bi/clipboard-plus-fill';
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
	export let removed: (() => void) | null = null;

	export let roles: PartialRole[] = [];
	export let myRole: PartialRole | null = null;

	interface PartialRole {
		id: string
		name: string
		position: number
		permissions: number
	}

	let trigger: () => void;
	let removing = false;
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
	const remove = async () => {
		removing = true;

		const response = await removeTeamMember(teamId, id);
		if (response.success)
			removed?.();

		removing = false;
	};
</script>

<div class="team-settings-member" class:removing>
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
	<button type="button" class="options" on:click={trigger} disabled={removing}>
		<ThreeDots/>
	</button>
	<ContextMenu.Root bind:trigger>
		<p>{name || username} (@{username})</p>
		{#if !removing && filteredRoles.length && owner !== id && (id !== $page.data.session?.sub || owner === $page.data.session.sub) && (owner === $page.data.session?.sub || (myRole && (hasBit(myRole.permissions, TeamRolePermission.ManageMembers) || hasBit(myRole.permissions, TeamRolePermission.Administrator))))}
			<ContextMenu.Sub>
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
			</ContextMenu.Sub>
			<div class="separator"/>
		{/if}
		{#if owner === $page.data.session?.sub || (myRole && hasOneOfBits(myRole.permissions, [TeamRolePermission.Administrator, TeamRolePermission.ManageMembers]))}
			<button type="button" on:click={remove} disabled={removing}>
				<BoxArrowLeft/>
				{$t('action.remove')}
			</button>
		{/if}
		<button type="button" on:click={() => navigator.clipboard.writeText(id)}>
			<ClipboardPlusFill/>
			{$t('action.copy_id')}
		</button>
	</ContextMenu.Root>
</div>

<style lang="scss">
	.team-settings-member {
		height: 64px;
		display: flex;
		padding: 0 28px;
		transition: opacity .5s;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 32px;
		&.removing {
			opacity: .5;
		}
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