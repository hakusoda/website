<script lang="ts">
	import { t } from '$lib/localisation';
	import { UserConnectionType } from '$lib/enums';
	import { getUserConnectionUrl } from '$lib/util';
	import { USER_CONNECTION_METADATA } from '$lib/constants';

	import UserConnection from '$lib/components/UserConnection.svelte';

	import ExclamationOctagonFill from '$lib/icons/ExclamationOctagonFill.svelte';

	import type { PageData } from './$types';
	export let data: PageData;

	let exists: UserConnectionType | null = null;
	const connect = (type: UserConnectionType) => {
		if (data.connections.some(item => item.type === type))
			return exists = type;
		exists = null;

		location.href = getUserConnectionUrl(type);
	};
</script>

<div class="main">
	<h1>{$t('settings.account.connections')}</h1>
	<p class="summary">{$t('settings.account.connections.summary')}</p>
	<p class="add">{$t('settings.account.connections.add')}</p>
	<div class="connection-types">
		{#each Object.values(UserConnectionType) as item}
			{#if typeof item === 'number'}
				<button type="button" class="item focusable" style={`--bg: ${USER_CONNECTION_METADATA[item].colour};`} on:click={() => connect(typeof item === 'number' ? item : 0)}>
					<svelte:component this={USER_CONNECTION_METADATA[item].icon}/>{$t(`user_connection.type.${item}`)}
				</button>
			{/if}
		{/each}
	</div>
	{#if exists !== null}
		<p class="exists">
			<ExclamationOctagonFill/>{$t('settings.account.connections.add.exists', [$t(`user_connection.type.${exists}`)])}
		</p>
	{/if}

	<div class="connections">
		{#each data.connections as item}
			<UserConnection {...item}/>
		{/each}
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
			gap: 16px;
			margin: 32px 0 0;
			display: flex;
			flex-direction: column;
		}
		.add {
			margin: 48px 0 12px;
			font-weight: 500;
		}
		.exists {
			gap: 12px;
			color: hsl(0 60% 55%);
			margin: 16px 0;
			display: flex;
			font-size: .9em;
			align-items: center;
		}
		.connection-types {
			gap: 12px;
			margin: 0 0 16px;
			display: flex;
			.item {
				gap: 8px;
				color: var(--color-primary);
				border: none;
				height: 40px;
				cursor: pointer;
				display: flex;
				padding: 0 24px;
				font-size: .9em;
				background: var(--bg);
				transition: box-shadow .25s;
				box-shadow: inset 0 0 0 1px var(--border-primary);
				font-weight: 500;
				line-height: 100%;
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 20px;
				text-decoration: none;
				&:hover {
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
			}
		}
	}
</style>