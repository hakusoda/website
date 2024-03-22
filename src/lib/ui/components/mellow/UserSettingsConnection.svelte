<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { UserConnectionType } from '$lib/shared/enums';
	import { USER_CONNECTION_METADATA } from '$lib/shared/constants';

	import Avatar from '../Avatar.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Plus from 'virtual:icons/bi/plus-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	import PersonPlusFill from 'virtual:icons/bi/person-plus-fill';
	import ExclamationTriangle from 'virtual:icons/bi/exclamation-triangle';
	export let kind: UserConnectionType | null = null;
	export let current: {
		id: string
		sub: string
		type: UserConnectionType
		username: string | null
		created_at: string
		avatar_url: string | null
		website_url: string | null
		display_name: string | null
	} | null = null;
	export let disabled = false;
	export let for_entry = false;
	export let user_connections: {
		id: string
		sub: string
		type: UserConnectionType
		username: string | null
		created_at: string
		avatar_url: string | null
		website_url: string | null
		display_name: string | null
	}[];
	export let add_connection: (kind: UserConnectionType, override_id?: string) => void;
	export let set_connection: (id: string, override_id?: string) => void;
	export let remove_connection: (id: string) => void;

	$: real_kind = kind ?? current?.type ?? UserConnectionType.Discord;
	$: metadata = USER_CONNECTION_METADATA[real_kind];

	$: note_variation = (current ? 3 : for_entry ? 2 : 0) as 0 | 2 | 3;

	$: available_connections = user_connections.filter(item => item.type === real_kind);

	let trigger: () => void;
</script>

<div class="user_settings_connection" class:selected={!!current}>
	<svelte:component this={metadata.icon} size={32}/>
	<div class="details">
		<p class="name">{$t(`user_connection.type.${real_kind}`)}</p>
		<p class="note">
			{$t(`mellow.user_settings_connection.note.${note_variation}`, [$t(`user_connection.type.${real_kind}`)])}
		</p>
	</div>
	{#if current}
		{#if current.username}
			<Check font-size={20}/>
		{:else}
			<p class="warning">
				<ExclamationTriangle/>Outdated
			</p>
		{/if}
	{/if}
	<button type="button" on:click={available_connections.length ? trigger : () => add_connection(real_kind)} {disabled}>
		{#if available_connections.length}
			{#if current}
				<Avatar src={current.avatar_url} size="xxs" transparent/>
				{current.display_name || current.username || current.sub} (@{current.username || current.sub})
				<ChevronDown/>
			{:else}
				Select Account<ChevronDown/>
			{/if}
		{:else}
			<PersonPlusFill/>Connect Account
		{/if}
	</button>
</div>

<ContextMenu.Root bind:trigger>
	<p>Your Accounts</p>
	{#each available_connections as connection}
		<button class="with_check" type="button" on:click={() => set_connection(connection.id, current?.id)}>
			<Avatar src={connection.avatar_url} size="xxs"/>
			{connection.display_name || connection.username || connection.sub}
			{#if current?.id === connection.id}
				<Check/>
			{/if}
		</button>
	{/each}
	<button class="with_check" type="button" on:click={() => current ? remove_connection(current.id) : null}>
		<X/>No account
		{#if !current}
			<Check/>
		{/if}
	</button>
	<div class="separator"/>
	<button type="button" on:click={() => add_connection(real_kind, current?.id)}>
		<Plus/>Use other account
	</button>
</ContextMenu.Root>

<style lang="scss">
	.user_settings_connection {
		height: 64px;
		display: flex;
		padding: 0 16px 0 24px;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-primary);
		align-items: center;
		border-radius: 24px;
		&.selected button {
			background: #0000002a;
			box-shadow: inset 0 0 0 1px var(--border-secondary);
			&:not(:disabled):hover {
				background: #ffffff0a;
			}
		}
		.details {
			margin: 0 auto 0 16px;
			p { margin: 0; }
			.note {
				color: var(--color-secondary);
				margin: 2px 0 0;
				font-size: .8em;
			}
		}
		button {
			gap: 8px;
			color: var(--button-color);
			border: none;
			height: 32px;
			cursor: pointer;
			display: flex;
			padding: 0 16px;
			font-size: .75em;
			background: var(--button-background);
			transition: opacity .5s, background .5s;
			box-shadow: inset 0 0 0 1px var(--button-border);
			font-weight: 500;
			margin-left: 16px;
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 8px;
			:global(.avatar) {
				margin: 0 4px 0 -8px;
			}
			&:disabled {
				cursor: not-allowed;
				opacity: .5;
			}
			&:not(:disabled):hover {
				background: var(--button-background-hover);
			}
		}
	}
	.with_check :global(svg:last-child:not(:first-child)) {
		margin-left: auto;
	}
	.warning {
		gap: 8px;
		color: #FFBE4B;
		margin: auto 0;
		display: flex;
		font-size: .9em;
		align-items: center;
	}
</style>