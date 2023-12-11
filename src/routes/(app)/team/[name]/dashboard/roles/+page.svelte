<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import type { PageData } from './$types';
	import { updateTeamRole } from '$lib/api';
	import type { RequestError } from '$lib/types';
	import { TeamRolePermission } from '$lib/enums';

	import Radio from '$lib/components/Radio.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';

	import ArrowLeft from '$lib/icons/ArrowLeft.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import ArrowRightShort from '$lib/icons/ArrowRightShort.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	let editing: typeof data['roles'][number] | null = null;
	let editingName = '';
	let editingPermissions = 0;
	$: editingName = editingName.substring(0, 20);
	$: editingHasAdmin = hasBit(editingPermissions, TeamRolePermission.Administrator);

	const save = async () => {
		saving = !(error = null);

		const response = await updateTeamRole(data.id, editing!.id, {
			name: editingName === editing!.name ? undefined : editingName
		});
		if (!response.success)
			return saving = !(error = response);

		editing!.name = editingName, editing!.permissions = editingPermissions;
		saving = !!(editing = null);
	};
	const reset = () => (editingName = editing!.name, editingPermissions = editing!.permissions);

	$: selfPermissions = data.members.find(member => member.id === data.session!.sub)?.role?.permissions ?? 0;
	$: canEdit = data.session!.sub === data.owner_id || hasBit(selfPermissions, TeamRolePermission.ManageRoles) || hasBit(selfPermissions, TeamRolePermission.Administrator);
</script>

{#if !editing}
	<div class="header">
		<div class="geist">
			<h1>{$t('team.settings.access.roles')}</h1>
			<p>{$t('team.settings.access.roles.summary')}</p>
		</div>
	</div>
	<div class="geist">
		<div class="items">
			{#each data.roles as item}
				<div class="item">
					<PeopleFill size={32}/>
					<div class="name">
						<h1>{item.name}</h1>
						<p>
							{$t(`team.created.${!!item.creator}`, [item.created_at])}
							{#if item.creator}
								<a href={`/user/${item.creator.username}`}>
									{item.creator.name || `@${item.creator.username}`}
								</a>
							{/if}
						</p>
					</div>
					{#if canEdit}
						<div class="buttons">
							<Button on:click={() => (editing = item, reset())}>
								<PencilFill/>{$t('action.edit')}
							</Button>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="header">
		<div class="geist">
			<h1>{$t('team.settings.access.roles')} — {editing.name}</h1>
			<button type="button" class="return" on:click={() => editing = null}>
				<ArrowLeft/>{$t('team.settings.access.roles.return')}
			</button>
		</div>
	</div>
	<div class="geist">
		<p class="input-label">{$t('mellow_link_editor.name')}</p>
		<TextInput bind:value={editingName}/>
	
		<p class="input-label">{$t('label.permissions')}</p>
		<div class="permissions">
			<!-- TODO: not do this... -->
			<div class="item">
				<Radio
					value={hasBit(editingPermissions, TeamRolePermission.InviteUsers)}
					disabled={editingHasAdmin}
					onChange={() => editingPermissions ^= TeamRolePermission.InviteUsers}
				/>
				<p>{$t('team_role_permission.2')}</p>
			</div>
			<div class="item">
				<Radio
					value={hasBit(editingPermissions, TeamRolePermission.ManageMembers)}
					disabled={editingHasAdmin}
					onChange={() => editingPermissions ^= TeamRolePermission.ManageMembers}
				/>
				<p>{$t('team_role_permission.4')}</p>
			</div>
			<div class="item">
				<Radio
					value={hasBit(editingPermissions, TeamRolePermission.ManageRoles)}
					disabled={editingHasAdmin}
					onChange={() => editingPermissions ^= TeamRolePermission.ManageRoles}
				/>
				<p>{$t('team_role_permission.8')}</p>
			</div>
			<div class="item">
				<Radio
					value={hasBit(editingPermissions, TeamRolePermission.ManageTeam)}
					disabled={editingHasAdmin}
					onChange={() => editingPermissions ^= TeamRolePermission.ManageTeam}
				/>
				<p>{$t('team_role_permission.1')}</p>
			</div>
			<div class="item admin">
				<Radio
					value={hasBit(editingPermissions, TeamRolePermission.Administrator)}
					onChange={() => editingPermissions ^= TeamRolePermission.Administrator}
				/>
				<p>{$t('team_role_permission.16')}</p>
			</div>
		</div>
	</div>

	<UnsavedChanges
		show={editingName !== editing.name || editingPermissions !== editing.permissions}
		error={error ? $t(`request_error.${error.error}`) : ''}
		{save}
		{reset}
		{saving}
	/>
{/if}

<style lang="scss">
	:global(.text-input) {
		width: 512px;
	}
	.items {
		gap: 16px;
		display: flex;
		margin-top: 32px;
		flex-direction: column;
		.item {
			display: flex;
			padding: 16px 20px 16px 28px;
			background: var(--background-secondary);
			align-items: center;
			border-radius: 36px;
			.name {
				margin-left: 16px;
				h1 {
					margin: 0;
					font-size: 1em;
					font-weight: 500;
				}
				p {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .8em;
				}
			}
			.buttons {
				gap: 16px;
				margin: 0 0 0 auto;
				display: flex;
			}
		}
	}
	.return {
		gap: 8px;
		color: var(--color-secondary);
		border: none;
		cursor: pointer;
		padding: 0;
		display: flex;
		font-size: .9em;
		background: none;
		align-items: center;
		font-family: var(--font-primary);
		&:hover {
			color: var(--color-primary);
		}
	}
	.input-label {
		color: var(--color-secondary);
		margin: 32px 0 8px;
		font-size: .9em;
	}
	.permissions {
		gap: 8px;
		display: flex;
		flex-direction: column;
		.item {
			display: flex;
			align-items: center;
			p {
				margin: 0 0 0 16px;
				font-size: .9em;
			}
			&.admin {
				margin-top: 24px;
			}
		}
	}
	@keyframes appear {
		0% {
			opacity: 0;
			transform: translateX(-16px);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
</style>