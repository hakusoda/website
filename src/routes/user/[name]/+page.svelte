<script lang="ts">
	import { t } from '$lib/localisation';
	import { UserFlags } from '$lib/enums';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import Star from '$lib/icons/Star.svelte';
	import Person from '$lib/icons/Person.svelte';
	import People from '$lib/icons/People.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
	export let data: PageData;
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={data.avatar_url} circle/>
			<div class="name">
				<h1>
					{data.name ?? data.username}
				</h1>
				<p>@{data.username}</p>
			</div>
		</div>
		<div class="buttons">
			<div class="roles">
				{#each Object.values(UserFlags) as flag}
					{#if typeof flag === 'number' && flag && (data.flags & flag) === flag}
						<p class="role"><Voxelified/>{$t(`user_role.${flag}`)}</p>
					{/if}
				{/each}
			</div>
		</div>
		{#if data.bio}
			<div class="separator"/>
			{data.bio}
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
						<Avatar src={item.avatar_url} size="sm"/>
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