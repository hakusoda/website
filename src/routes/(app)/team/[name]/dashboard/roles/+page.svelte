<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/shared/util';
	import { TeamRolePermission } from '$lib/shared/enums';

	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data;

	$: selfRole = data.members.find(member => member.id === data.session!.sub)?.role;
	$: selfPermissions = selfRole?.permissions ?? 0;
	$: isOwner = data.session!.sub === data.owner_id;
	$: canEdit = isOwner || hasBit(selfPermissions, TeamRolePermission.ManageRoles) || hasBit(selfPermissions, TeamRolePermission.Administrator);
</script>

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
				<PeopleFill font-size={32}/>
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
				{#if canEdit && (isOwner || (selfRole && selfRole.position > item.position))}
					<Button href={`/team/${$page.params.name}/dashboard/roles/${item.id}`}>
						<PencilFill/>{$t('action.edit')}
					</Button>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
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
				margin: 0 auto 0 16px;
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
		}
	}
</style>