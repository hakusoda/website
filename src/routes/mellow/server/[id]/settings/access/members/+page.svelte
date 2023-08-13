<script lang="ts">
	import { onMount } from 'svelte';
	import { Select, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { DiscordMember } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';

	let query = '';
	//let loading = false;

	let sortBy = 0;
	let results: DiscordMemberWithSyncInfo[] | null = null;
	let allMembers: DiscordMemberWithSyncInfo[] = [];

	$: if (query) {
		/*const body = query;
		loading = true;

		setTimeout(async () => {
			if (query === body) {
				results = await fetch(`/mellow/server/${$page.params.id}/get-members`)
					.then(response => response.json());
				loading = false;
			}
		}, 1000);*/
		results = allMembers.filter(item => item.user.global_name?.toLowerCase().includes(query.toLowerCase()) || item.user.username.toLowerCase().includes(query.toLowerCase()))
	} else
		results = null;

	onMount(() => fetch(`/mellow/server/${$page.params.id}/get-members`)
		.then(response => response.json())
		.then(items => allMembers = items)
	);

	interface DiscordMemberWithSyncInfo extends DiscordMember {
		primary_roblox_link: number | null
	}
</script>

<div class="main">
	<h1>{$t('mellow.server.settings.access.members.header')}</h1>
	<p class="summary">{$t('mellow.server.settings.access.members.summary')}</p>

	<div class="members">
		{#each (results ?? allMembers).sort((a, b) => sortBy === 1 ? Date.parse(b.joined_at) - Date.parse(a.joined_at) : (sortBy === 2 ? Number(!!b.primary_roblox_link) - Number(!!a.primary_roblox_link) : false) || (a.user.global_name || a.user.username).localeCompare(b.user.global_name || b.user.username)) as item}
			<a class="item" href={`https://discord.com/users/${item.user.id}`} target="_blank">
				<Avatar src={`https://cdn.discordapp.com/avatars/${item.user.id}/${item.user.avatar}.png?size=256`} size="sm" circle/>
				<div class="name">
					<h1>{item.user.global_name || item.user.username}</h1>
					<p>
						{#if item.user.discriminator.length > 1}
							{item.user.username}#{item.user.discriminator}
						{:else}
							@{item.user.username}
						{/if}
						• {$t('profile.joined', [item.joined_at])} • {$t(`mellow.server.settings.access.members.item.syncable.${!!item.primary_roblox_link}`)}
						{#if item.primary_roblox_link}
							<a href={`https://roblox.com/users/${item.primary_roblox_link}`} target="_blank">
								{item.primary_roblox_link}
							</a>
						{/if}
					</p>
				</div>
			</a>
		{/each}
	</div>

	<div class="fade"/>
	<div class="search">
		<TextInput bind:value={query} placeholder={$t('mellow.server.settings.access.members.search')}/>

		<p class="sort">{$t('mellow.server.settings.access.members.sort')}</p>
		<Select.Root bind:value={sortBy}>
			<Select.Item value={0}>
				{$t('mellow.server.settings.access.members.sort.type.0')}
			</Select.Item>
			<Select.Item value={1}>
				{$t('mellow.server.settings.access.members.sort.type.1')}
			</Select.Item>
			<Select.Item value={2}>
				{$t('mellow.server.settings.access.members.sort.type.2')}
			</Select.Item>
		</Select.Root>
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		display: flex;
		padding: 32px 64px 32px 64px;
		position: relative;
		flex-direction: column;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			line-height: 1.25;
			white-space: pre-wrap;
			margin-bottom: 32px;
		}
		.members {
			gap: 8px;
			display: flex;
			padding: 0 0 32px;
			overflow: auto;
			flex-direction: column;
			.item {
				display: flex;
				padding: 8px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				text-decoration: none;
				.name {
					margin-left: 16px;
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 2px 0 0;
						font-size: .9em;
					}
				}
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
		.fade {
			left: 0;
			width: 100%;
			bottom: 96px;
			height: 32px;
			position: absolute;
			background: linear-gradient(to bottom, transparent, var(--background-primary));
		}
		.search {
			margin: auto 0 0;
			display: flex;
			padding: 32px 0 0;
			align-items: center;
			.sort {
				color: var(--color-secondary);
				margin: 0 16px 0 auto;
				font-size: .9em;
			}
		}
	}
</style>