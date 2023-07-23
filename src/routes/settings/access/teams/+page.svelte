<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	
	import X from '$lib/icons/X.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let data: PageData;
</script>

<div class="main">
	<h1>{$t('user_action.user.teams')}</h1>
	<div class="teams">
		{#each data.teams.sort((a, b) => a.display_name.localeCompare(b.display_name)) as item}
			<a class="item focusable" href={`/team/${item.name}`}>
				<Avatar src={item.avatar_url} size="sm2"/>
				<div class="name">
					<h1 title={item.display_name}>{item.display_name}</h1>
					<p>{item.name} • {$t('members', [item.members[0].count])}</p>
				</div>
				<div class="buttons">
					<Button href={`/team/${item.name}/settings/profile`}>
						<BoxArrowUpRight/>{$t('action.manage')}
					</Button>
					<Button>
						<X/>{$t('action.leave')}
					</Button>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 128px 32px 64px;
		.teams {
			gap: 16px;
			display: flex;
			flex-wrap: wrap;
			.item {
				width: calc(30% - 16px);
				display: flex;
				padding: 16px 8px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 8px;
				flex-direction: column;
				text-decoration: none;
				.name {
					width: 100%;
					display: flex;
					overflow: hidden;
					margin-top: 16px;
					align-items: center;
					flex-direction: column;
					h1 {
						margin: 0;
						overflow: hidden;
						max-width: 100%;
						font-size: 1.25em;
						font-weight: 600;
						white-space: nowrap;
						text-overflow: ellipsis
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .8em;
					}
				}
				.buttons {
					gap: 8px;
					display: flex;
					margin-top: 16px;
				}
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
	}
</style>