<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import { TeamFlag, TeamRolePermission } from '$lib/enums';

	import Avatar from '$lib/components/Avatar.svelte';
	
	import Plus from 'virtual:icons/bi/plus-lg';
	import GearFill from 'virtual:icons/bi/gear-fill';
	import StarFill from 'virtual:icons/bi/star-fill';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	import PersonFill from 'virtual:icons/bi/person-fill';
	import BoxArrowRight from 'virtual:icons/bi/box-arrow-right';
	import PatchCheckFill from 'virtual:icons/bi/patch-check-fill';
	export let data;
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('user_action.user.teams')}</h1>
	</div>
</div>
<div class="geist teams-page">
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
				<div class="details">
					<p>
						<PersonFill font-size={14}/>
						{item.role?.name ?? $t('team_role.unknown')}
					</p>
					<p>
						<StarFill font-size={14}/>
						{#if item.owner}
							<a href={`/user/${item.owner.username}`}>
								{item.owner.name || item.owner.username}
							</a>
						{:else}
							{$t('team.owner.none')}
						{/if}
					</p>
					<p><PeopleFill font-size={14}/>{item.members[0].count}</p>
				</div>
				<div class="buttons">
					{#if data.session?.sub === item.owner?.id || (item.role && hasBit(item.role.permissions, TeamRolePermission.ManageTeam))}
						<a href={`/team/${item.name}/dashboard/profile`}>
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
	<Button href="/settings/teams/create">
		<Plus/>{$t('settings.access.teams.create')}
	</Button>
</div>

<style lang="scss">
	.teams-page {
		margin-top: 32px;
		margin-bottom: 32px;
	}
	.teams {
		gap: 16px;
		margin: 0 0 16px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
		.item {
			display: flex;
			padding: 16px;
			overflow: hidden;
			transition: box-shadow .5s;
			background: var(--background-secondary);
			box-shadow: inset 0 0 0 1px var(--border-primary);
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
				margin: 8px 0 0;
				height: fit-content;
				display: flex;
				p {
					gap: 6px;
					color: var(--color-secondary);
					margin: 0;
					height: 24px;
					display: flex;
					padding: 0 10px;
					overflow: hidden;
					font-size: .75em;
					box-shadow: 0 0 0 1px var(--border-secondary);
					white-space: nowrap;
					align-items: center;
					border-radius: 16px;
					:global(svg) {
						min-width: 14px;
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
</style>