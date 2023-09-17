<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { RequestError } from '$lib/types';
	import { removeUserConnection } from '$lib/api';
	import { GITHUB_OAUTH_URL, DISCORD_OAUTH_URL } from '$lib/constants';

	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import GitHubText from '$lib/icons/GitHubText.svelte';
	import DiscordText from '$lib/icons/DiscordText.svelte';

	import type { PageData } from './$types';
	import { UserConnectionType } from '$lib/enums';
	export let data: PageData;
	
	let error: RequestError | null = null;
	let removing: string[] = [];
	const remove = async (id: string) => {
		removing = [...removing, id];

       	const response = await removeUserConnection(id);
		if (response.success)
			data.connections = data.connections.filter(item => item.id !== id);
		else
			error = response;

		removing = removing.filter(item => item !== id);
    };
</script>

<div class="main">
	<h1>{$t('settings.account.connections')}</h1>
	<p class="summary">{$t('settings.account.connections.summary')}</p>
	<div class="connections">
		{#each data.connections as item}
			<div class="item">
				{#if item.type === UserConnectionType.Discord}
					<Discord size={32}/>
				{:else}
					<GitHub size={32}/>
				{/if}
				<div class="details">
					<h1>{item.name}</h1>
					<p>{$t(`user_connection.type.${item.type}`)} • {item.sub} • {$t('user_connection.created', [item.created_at])}</p>
				</div>
				<Button on:click={() => remove(item.id)} disabled={removing.includes(item.id)}>
					<X/>{$t('action.remove')}
				</Button>
			</div>
		{/each}
	</div>
	<RequestErrorUI data={error}/>

	<p class="add">{$t('settings.account.connections.add')}</p>
	<div class="connection-types">
		<a href={DISCORD_OAUTH_URL} class="item" style="--bg: #5865F2;">
			<DiscordText size={24}/>
		</a>
		<a href={GITHUB_OAUTH_URL} class="item" style="--bg: #333;">
			<GitHub size={24}/>
			<GitHubText size={24}/>
		</a>
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0 64px 32px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.connections {
			gap: 8px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 20px 16px 28px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 36px;
				.details {
					margin: 0 auto 0 24px;
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
		.add {
			margin: 64px 0 16px;
			font-weight: 500;
		}
		.connection-types {
			gap: 16px;
			display: flex;
			.item {
				gap: 12px;
				display: flex;
				padding: 14px 24px;
				background: var(--bg);
				transition: box-shadow .25s;
				box-shadow: inset 0 0 0 1px var(--border-primary);
				border-radius: 20px;
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
	}
</style>