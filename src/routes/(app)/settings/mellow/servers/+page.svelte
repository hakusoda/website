<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import { createMellowServerDiscordRedirectUrl } from '$lib/util';

	import Avatar from '$lib/components/Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import ArrowClockwise from '$lib/icons/ArrowClockwise.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let data: PageData;

	$: if (browser && $page.url.searchParams.get('code'))
		history.replaceState({}, '', '/settings/mellow/servers');
	$: discordUrl = `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=${encodeURIComponent(createMellowServerDiscordRedirectUrl($page.url.origin))}&response_type=code&scope=identify%20guilds`;
</script>

<div class="main">
	<h1>{$t('settings.mellow.servers')}</h1>
	<p class="add">{$t('settings.mellow.servers.add')}</p>
	<div class="servers">
		{#each data.servers.sort((a, b) => a.name.localeCompare(b.name)) as item}
			<div class="item focusable">
				<Avatar src={item.avatar_url} size="sm2" transparent/>
				<div class="name">
					<h1>{item.name}</h1>
					<p>{$t('settings.mellow.servers.server.members', [item.members[0].count])}</p>
				</div>
				<div class="buttons">
					<Button href={`/mellow/server/${item.id}`}>
						<BoxArrowUpRight/>{$t('action.view')}
					</Button>
					<Button>
						<X/>{$t('action.leave')}
					</Button>
				</div>
			</div>
		{/each}
		{#each data.allServers.filter(item => !data.servers.some(i => i.id === item.id)).sort((a, b) => a.name.localeCompare(b.name)) as item}
			<div class="item focusable unknown">
				<Avatar src={`https://cdn.discordapp.com/icons/${item.id}/${item.icon}.webp?size=128`} size="sm2" transparent/>
				<div class="name">
					<h1>{item.name}</h1>
					<p>{$t('settings.mellow.servers.server.placeholder')}</p>
				</div>
			</div>
		{/each}
	</div>
	<Button href={discordUrl}>
		<ArrowClockwise/>{$t('settings.mellow.servers.refresh')}
	</Button>
</div>

<style lang="scss">
	.main {
		width: 100%;
		padding: 0 64px 32px;
		overflow: auto;
		.add {
			color: var(--color-secondary);
			font-size: .9em;
		}
		.servers {
			gap: 16px;
			margin: 24px 0 16px;
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
					margin-top: 16px;
					text-align: center;
					white-space: nowrap;
					flex-direction: column;
					h1 {
						margin: 0;
						overflow: hidden;
						font-size: 1.25em;
						font-weight: 600;
						text-overflow: ellipsis;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .8em;
					}
				}
				&.unknown {
					background: none;
					box-shadow: 0 0 0 1px var(--border-primary);
				}
				.buttons {
					gap: 8px;
					display: flex;
					margin-top: 16px;
				}
			}
		}
	}
</style>