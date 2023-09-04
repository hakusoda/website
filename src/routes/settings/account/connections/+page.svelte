<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { deserialize } from '$app/forms';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';
	import { createUserConnectionsDiscordRedirectUrl } from '$lib/util';

	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import DiscordText from '$lib/icons/DiscordText.svelte';

	import type { PageData } from './$types';
	import { UserConnectionType } from '$lib/enums';
	export let data: PageData;

	$: if (browser && $page.url.searchParams.get('code'))
		history.replaceState({}, '', '/settings/account/connections');
	$: discordUrl = `https://discord.com/api/oauth2/authorize?client_id=1068554282481229885&redirect_uri=${encodeURIComponent(createUserConnectionsDiscordRedirectUrl($page.url.origin))}&response_type=code&scope=identify`;

	let error: RequestError | null = null;
	const remove = async (body: string) => {
       	const response = await fetch('?/remove', { body, method: 'POST' });
		const result = deserialize(await response.text());
		if (result.type === 'success')
			return location.reload();
		else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline } satisfies RequestError;
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
				{/if}
				<div class="details">
					<h1>{item.name}</h1>
					<p>{$t(`user_connection.type.${item.type}`)} • {item.sub}</p>
				</div>
				<button type="button" class="remove" title={$t('action.remove')} on:click={() => remove(item.id)}>
					<X/>
				</button>
			</div>
		{/each}
	</div>
	<RequestErrorUI data={error}/>

	<h2>{$t('settings.account.connections.add')}</h2>
	<div class="connection-types">
		<a href={discordUrl} class="item" style="--bg: #5865F2;">
			<DiscordText size={24}/>
		</a>
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0 128px 32px 64px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			line-height: 1.25;
			white-space: pre-wrap;
		}
		.connections {
			gap: 16px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 24px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.details {
					margin-left: 24px;
					h1 {
						margin: 0;
						font-size: 1.25em;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.remove {
					color: var(--color-primary);
					border: none;
					cursor: pointer;
					padding: 0;
					display: flex;
					background: none;
					margin-left: auto;
				}
			}
		}
		h2 {
			margin-top: 64px;
		}
		.connection-types {
			gap: 16px;
			display: flex;
			.item {
				display: flex;
				padding: 12px 16px;
				background: var(--bg);
				transition: box-shadow .25s;
				border-radius: 8px;
				&:hover {
					box-shadow: inset 0 0 0 1px #ffffff40, 0 0 8px 0 var(--bg);
				}
			}
		}
	}
</style>