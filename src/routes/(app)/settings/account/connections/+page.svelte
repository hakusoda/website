<script lang="ts">
	import { t } from '$lib/ui/localisation/index';
	import { UserConnectionKind } from '$lib/shared/enums';
	import { getUserConnectionUrl } from '$lib/shared/util';
	import { USER_CONNECTION_METADATA } from '$lib/shared/constants';

	import UserConnection from '$lib/ui/components/UserConnection.svelte';

	import ExclamationOctagonFill from 'virtual:icons/bi/exclamation-octagon-fill.svelte';
	export let data;

	let exists: UserConnectionKind | null = null;
</script>

<div class="header">
	<h2>{$t('settings.account.connections')}</h2>
	<p>{$t('settings.account.connections.summary')}</p>
</div>

<p class="add">{$t('settings.account.connections.add')}</p>
<div class="connection-types">
	{#each Object.values(UserConnectionKind) as item}
		{#if typeof item === 'number' && item !== UserConnectionKind.YouTube}
			<a class="item focusable" href={getUserConnectionUrl(item)} style={`--bg: ${USER_CONNECTION_METADATA[item]?.colour}; color: ${USER_CONNECTION_METADATA[item]?.text_colour || 'unset'}`}>
				<svelte:component this={USER_CONNECTION_METADATA[item]?.icon} fill={USER_CONNECTION_METADATA[item]?.icon_colour}/>{$t(`user_connection.type.${item}`)}
			</a>
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

<style lang="scss">
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
			transition: background .5s, box-shadow .5s;
			box-shadow: inset 0 0 0 1px var(--border-primary);
			font-weight: 500;
			line-height: 100%;
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 20px;
			text-decoration: none;
			&:hover {
				background: color-mix(in srgb, var(--bg) 95%, #fff);
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
		}
	}
</style>