<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { createMellowServerDiscordRedirectUrl } from '$lib/shared/util';

	import Avatar from '$lib/ui/components/Avatar.svelte';

	import ArrowClockwise from 'virtual:icons/bi/arrow-clockwise';
	export let data;

	let itemFilter = '';
	$: if (browser && $page.url.searchParams.get('code'))
		history.replaceState({}, '', '/settings/mellow');
	$: discordUrl = `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=${encodeURIComponent(createMellowServerDiscordRedirectUrl($page.url.origin))}&response_type=code&scope=identify%20guilds`;
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('settings.mellow.servers')}</h1>
	</div>
</div>
<div class="geist">
	{#if data.servers.length}
		<a class="banner small" href="/docs/mellow" target="_blank">
			{$t('settings.mellow.servers.documentation')}
		</a>
	{:else}
		<a class="banner" href="/docs/mellow/quickstart" target="_blank">
			<h1>{$t('settings.mellow.servers.get_started')}</h1>
			<p>{$t('settings.mellow.servers.get_started.details')}</p>
		</a>
	{/if}
	<div class="search">
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<Button href={discordUrl}>
			<ArrowClockwise/>{$t('settings.mellow.servers.refresh')}
		</Button>
	</div>
	<div class="servers">
		{#each data.servers.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)) as item}
			<a class="item" href={`/mellow/server/${item.id}`}>
				<div class="header">
					<Avatar src={item.avatar_url} size="sm" transparent/>
					<div class="text">
						<h1>{item.name}</h1>
						<p>{$t('settings.mellow.servers.server.owner', [item.owner_team_name || item.owner_user_name || item.owner_user_username])}</p>
					</div>
				</div>
			</a>
		{/each}
		{#each data.allServers.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase()) && !data.servers.some(i => i.id === item.id)).sort((a, b) => a.name.localeCompare(b.name)) as item}
			<a class="item connect" href={`https://discord.com/channels/${item.id}`} target="_blank">
				<div class="header">
					<Avatar src={`https://cdn.discordapp.com/icons/${item.id}/${item.icon}.webp?size=128`} size="sm" transparent/>
					<div class="text">
						<h1>{item.name}</h1>
						<p>{$t('settings.mellow.servers.server.connect')}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="scss">
	.banner {
		margin: 16px 0 0;
		display: block;
		padding: 32px 40px;
		transition: filter 1s;
		box-shadow: inset 0 0 0 1px #ffffff1a;
		background: center/100% url('/img/mellow/get_started.svg');
		border-radius: 32px;
		text-decoration: none;
		&.small {
			padding: 16px 24px;
			font-size: .9em;
			border-radius: 16px;
		}
		&:hover {
			filter: brightness(1.25);
		}
		h1 {
			margin: 0;
			filter: drop-shadow(0 0 4px #00000080);
			font-size: 1.75em;
			font-weight: 600;
		}
		p {
			margin: 8px 0 0;
			filter: drop-shadow(0 0 2px #00000080);
			font-size: .9em;
		}
	}
	.search {
		margin: 24px 0 0;
		display: flex;
		padding: 24px 0 0;
		border-top: 1px solid var(--border-primary);
		justify-content: space-between;
	}
	.servers {
		gap: 16px;
		margin: 24px 0 16px;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
			&.connect {
				background: none;
				box-shadow: inset 0 0 0 1px var(--border-primary);
			}
			&:hover {
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
			.header {
				gap: 16px;
				display: flex;
				align-items: center;
				.text {
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
						white-space: nowrap;
					}
					p {
						color: var(--color-secondary);
						margin: 2px 0 0;
						font-size: .8em;
					}
				}
			}
		}
	}
</style>