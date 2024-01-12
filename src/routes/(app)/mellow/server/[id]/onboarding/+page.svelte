<script lang="ts">
	import { Button, ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { getUserConnectionUrl } from '$lib/util';
	import type { UserConnectionType } from '$lib/enums';
	import { USER_CONNECTION_METADATA } from '$lib/constants';
	import { updateMellowUserServerSettings } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';

	import Check from 'virtual:icons/bi/check-lg';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	export let data;

	let trigger: () => void;
	let connections: Partial<Record<UserConnectionType, typeof data['current_connections'][number]>> = {};
	$: {
		const autoSelect = parseInt($page.url.searchParams.get('auto_select')!);
		if (autoSelect)
			connections[autoSelect as UserConnectionType] = data.current_connections.find(item => item.type === autoSelect);
	}

	$: bannerUrl = data.discord.banner ? `https://cdn.discordapp.com/banners/${data.discord.id}/${data.discord.banner}.webp?size=512` : `https://cdn.discordapp.com/icons/${data.discord.id}/${data.discord.icon}.webp?size=512`;

	let state = data.skip ? 1 : 0;
	let saving = false;
	const save = async () => {
		saving = true;
		await updateMellowUserServerSettings($page.params.id, {
			connections: Object.values(connections).map(item => ({ id: item.id }))
		});
		state++;
	};
</script>

<div class="mellow-onboarding">
	{#if !state}
		<div class="server">
			<div class="banner">
				<img src={bannerUrl} alt="" height="128"/>
				<img src={bannerUrl} alt="" class="blurred" height="128"/>
			</div>
			<h1>{$t('mellow_onboarding.server', [data.discord.name])}</h1>
			<p>{$t('mellow_onboarding.server.sub')}</p>
		</div>

		<h3>{$t('mellow_onboarding.connections')}</h3>
		<p class="conn-info">{$t('mellow_onboarding.connections.sub')}</p>
		<div class="connections">
			{#each data.connections as item}
				<button class="item" type="button" on:click={data.current_connections.some(i => i.type === item.type) ? trigger : () => location.href = getUserConnectionUrl(item.type) + `&state=mlw${$page.params.id}mlw`}>
					<svelte:component this={USER_CONNECTION_METADATA[item.type]?.icon} size={32} font-size={32}/>
					{#if connections[item.type]}
						<img src={connections[item.type]?.avatar_url} alt="" width="32" height="32"/>
					{/if}
					<div class="details">
						<h1>{$t(`user_connection.type.${item.type}`)}</h1>
						{#if connections[item.type]}
							<p>{$t('mellow_onboarding.connection.chosen', [connections[item.type]?.display_name])}</p>
						{:else}
							<p>{$t('mellow_onboarding.connection.summary', [$t(`user_connection.type.${item.type}`), item.actions])}</p>
						{/if}
					</div>
					<ChevronDown/>
				</button>
				<ContextMenu.Root bind:trigger>
					<p>{$t('mellow_onboarding.connection.accounts', [$t(`user_connection.type.${item.type}`)])}</p>
					{#each data.current_connections.filter(i => i.type === item.type) as connection}
						<button type="button" on:click={() => connections[item.type] = connection}>
							<Avatar src={connection.avatar_url} size="xxs" circle/>
							{connection.display_name}
						</button>
					{/each}
					<button type="button" on:click={() => connections[item.type] = undefined}>
						{$t('label.none')}
					</button>
				</ContextMenu.Root>
			{/each}
		</div>

		<Button on:click={save} disabled={saving}>
			<Check/>{$t('action.continue')}
		</Button>
	{:else}
		<p class="done">{$t('mellow_onboarding.done')}</p>
	{/if}
</div>

<style lang="scss">
	.mellow-onboarding {
		display: flex;
		min-height: calc(100vh - 56px);
		align-items: center;
		flex-direction: column;
		.done {
			margin: auto;
		}
		.server {
			margin: 48px 0 0;
			display: flex;
			overflow: hidden;
			background: var(--background-secondary);
			align-items: center;
			border-radius: 24px;
			flex-direction: column;
			h1 {
				margin: 24px 0 0;
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 24px;
				font-size: .9em;
			}
		}
		.banner {
			width: 640px;
			height: max-content;
			display: flex;
			overflow: hidden;
			position: relative;
			img:not(.blurred) {
				top: 0;
				left: 50%;
				z-index: 1;
				position: absolute;
				transform: translateX(-50%);
			}
			.blurred {
				width: inherit;
				filter: blur(8px);
				opacity: .5;
				overflow: hidden;
				object-fit: cover;
			}
		}
		h3 {
			margin: 64px 0 8px;
		}
		.conn-info {
			color: var(--color-secondary);
			margin: 0 0 24px;
			font-size: .9em;
			text-align: center;
			white-space: pre;
			line-height: normal;
		}
		.connections {
			gap: 16px;
			margin: 0 0 24px;
			display: flex;
			flex-direction: column;
			.item {
				width: 640px;
				color: var(--color-primary);
				border: none;
				height: 64px;
				cursor: pointer;
				display: flex;
				padding: 0 28px;
				font-size: 1em;
				text-align: start;
				transition: box-shadow .5s;
				box-shadow: inset 0 0 0 1px #ffffff1a;
				background: var(--background-secondary);
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 32px;
				img {
					border-radius: 50%;
				}
				&:has(img) > :global(svg:first-child) {
					top: 32px;
					left: 48px;
					width: 16px;
					height: 24px;
					filter: drop-shadow(0 0 1px #000);
					position: absolute;
				}
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
				&:hover {
					box-shadow: inset 0 0 0 1px #ffffff40;
				}
			}
		}
	}
</style>