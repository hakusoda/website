<script lang="ts">
	import { t } from '$lib/localisation';
	import { UserFlags } from '$lib/enums';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import Person from '$lib/icons/Person.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
	export let data: PageData;

	$: user = data.profile!;
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={user.avatar_url} circle/>
			<div class="name">
				<h1>
					{user.name ?? user.username}
				</h1>
				<p>@{user.username}</p>
			</div>
		</div>
		<div class="buttons">
			<div class="roles">
				{#each Object.values(UserFlags) as flag}
					{#if typeof flag === 'number' && flag && (user.flags & flag) === flag}
						<p class="role"><Voxelified/>{$t(`user_role.${flag}`)}</p>
					{/if}
				{/each}
			</div>
		</div>
		{#if user.bio}
			<div class="separator"/>
			{user.bio}
		{/if}
		<div class="separator"/>
		<div class="counter">
			<Sunrise/>
			<p>{$t('profile.joined', [user.created])}</p>
		</div>
		{#if data.robloxLinks.length}
			<div class="separator"/>
			<div class="counter">
				<Person/>
				<p>{$t('profile.roblox')}</p>
			</div>
			<div class="roblox">
				{#each data.robloxUsers as user}
					<a href={`https://roblox.com/users/${user.id}/profile`}>
						<Avatar src={user.icon} size="xxs" circle/>
						{user.displayName}
					</a>
				{/each}
			</div>
		{/if}
		<div class="separator"/>
		<div class="counter">
			<Person/>
			<p>{$t('profile.id', [user.id])}</p>
		</div>
	</div>
</div>

<svelte:head>
	<title>{user.name ?? user.username}</title>
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
		}
	}
</style>