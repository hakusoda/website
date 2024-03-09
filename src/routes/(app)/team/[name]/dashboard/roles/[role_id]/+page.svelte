<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { hasBit } from '$lib/shared/util';
	import { updateTeamRole } from '$lib/client/api';
	import { TeamRolePermission } from '$lib/shared/enums';
	import { editor, set_editor_callback } from '$lib/client/store';

	import Radio from '$lib/ui/components/Radio.svelte';
	import WithSideNavigation from '$lib/ui/layouts/WithSideNavigation.svelte';

	import LockFill from 'virtual:icons/bi/lock-fill';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data;

	$: role = data.roles.find(item => item.id === $page.params.role_id);

	let name = '';
	let permissions = 0;
	const reset = () => (name = role!.name, permissions = role!.permissions);
	$: if (role)
		reset();

	$: editingHasAdmin = hasBit(permissions, TeamRolePermission.Administrator);

	$: editor.canSave.set(name !== role?.name || permissions !== role?.permissions);

	const PERMISSIONS = (Object.values(TeamRolePermission)
		.filter(i => typeof i === 'number' && i && i !== TeamRolePermission.Administrator) as TeamRolePermission[])
		.sort((a, b) => TeamRolePermission[a].localeCompare(TeamRolePermission[b]));

	set_editor_callback(async () => {
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