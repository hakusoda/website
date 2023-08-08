<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import type { PageData } from './$types';
	import { TeamFlag, TeamRolePermission } from '$lib/enums';

	import Avatar from '$lib/components/Avatar.svelte';
	
	import Plus from '$lib/icons/Plus.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	import PatchCheckFill from '$lib/icons/PatchCheckFill.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let data: PageData;
</script>

<div class="main">
	<h1>{$t('user_action.user.teams')}</h1>
	<p class="summary">{$t('settings.access.teams.summary')}</p>

	<div class="teams">
		{#each data.teams.sort((a, b) => a.display_name.localeCompare(b.display_name)) as item}
			<a class="item focusable" href={`/team/${item.name}`}>
				<div class="header">
					<Avatar src={item.avatar_url} size="sm2"/>
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
				<div class="buttons">
					{#if data.session?.user.id === item.owner_id || (item.role && hasBit(item.role.permissions, TeamRolePermission.ManageTeam))}
						<a href={`/team/${item.name}/settings/profile`}>
							<GearFill/>{$t('action.manage')}
						</a>
					{/if}
					<button type="button" class="leave" on:click|stopPropagation>
						<BoxArrowRight/>{$t('action.leave')}
					</button>
				</div>
			</a>
		{/each}
	</div>

	<Button href="/settings/access/teams/create">
		<Plus/>{$t('settings.access.teams.create')}
	</Button>
</div>

<style lang="scss">
	.main {
		width: 100%;
		padding: 32px 64px 32px 64px;
		overflow: auto;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			line-height: 1.25;
			white-space: pre-wrap;
			margin-bottom: 32px;
		}
		.teams {
			gap: 16px;
			margin: 0 0 16px;
			display: flex;
			flex-wrap: wrap;
			.item {
				width: calc(30% - 16px);
				display: flex;
				padding: 16px;
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
				.buttons {
					display: flex;
					margin-top: 16px;
					a, button {
						gap: 8px;
						color: var(--color-secondary);
						border: none;
						cursor: pointer;
						padding: 0;
						display: flex;
						font-size: .9em;
						background: none;
						font-family: var(--font-primary);
						text-decoration: none;
						&:hover {
							color: var(--color-primary);
						}
					}
					.leave {
						margin-left: auto;
					}
				}
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
	}
</style>