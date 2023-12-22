<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { hasBit } from '$lib/util';
	import { updateTeamRole } from '$lib/api';
	import { TeamRolePermission } from '$lib/enums';
	import { editor, setEditorCallback } from '$lib/store';

	import Radio from '$lib/components/Radio.svelte';
	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import LockFill from '$lib/icons/LockFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	export let data;

	const role = data.roles.find(item => item.id === $page.params.role_id);

	let name = '';
	let permissions = 0;
	$: if (role)
		name = role.name, permissions = role.permissions;

	$: editingHasAdmin = hasBit(permissions, TeamRolePermission.Administrator);

	$: editor.canSave.set(name !== role?.name || permissions !== role?.permissions);

	const PERMISSIONS = (Object.values(TeamRolePermission)
		.filter(i => typeof i === 'number' && i && i !== TeamRolePermission.Administrator) as TeamRolePermission[])
		.sort((a, b) => TeamRolePermission[a].localeCompare(TeamRolePermission[b]));

	setEditorCallback(async () => {
		const response = await updateTeamRole(data.id, $page.params.role_id, {
			name: name === role!.name ? undefined : name,
			permissions: permissions === role!.permissions ? undefined : permissions
		});
		if (response.success)
			await goto(`/team/${$page.params.name}/dashboard/roles`, { invalidateAll: true });
	});

	$: selfRole = data.members.find(member => member.id === data.session!.sub)?.role;
	$: selfPermissions = selfRole?.permissions ?? 0;
</script>

<WithSideNavigation items={data.roles.map(item => {
	const editable = data.owner_id === data.session?.sub || (selfRole && selfRole.position > item.position && (hasBit(selfPermissions, TeamRolePermission.ManageRoles) || hasBit(selfPermissions, TeamRolePermission.Administrator)));
	return [`/team/${$page.params.name}/dashboard/roles/${item.id}`, editable ? PeopleFill : LockFill, item.name, !editable];
})}>
	{#if role}
		<p class="input-label">{$t('profile.name')}</p>
		<TextInput bind:value={name}/>

		<p class="input-label">{$t('label.permissions')}</p>
		<div class="permissions">
			{#each PERMISSIONS as item}
				<div>
					<Radio
						value={hasBit(permissions, item)}
						disabled={editingHasAdmin}
						onChange={() => permissions ^= item}
					/>
					<p>{$t(`team_role_permission.${item}`)}</p>
				</div>
			{/each}
			<div class="admin">
				<Radio
					value={hasBit(permissions, TeamRolePermission.Administrator)}
					onChange={() => permissions ^= TeamRolePermission.Administrator}
				/>
				<p>{$t('team_role_permission.16')}</p>
			</div>
		</div>
	{/if}
</WithSideNavigation>

<style lang="scss">
	.input-label:first-child {
		margin-top: 0;
	}
	.permissions {
		gap: 8px;
		display: flex;
		flex-direction: column;
		div {
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
</style>