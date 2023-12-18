<script lang="ts">
	import { DropdownMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { invalidateAll } from '$app/navigation';
	import { removeUserConnection } from '../api';
	import type { UserConnectionType } from '../enums';
	import { USER_CONNECTION_METADATA } from '../constants';

	import X from '../icons/X.svelte';
	import ThreeDots from '../icons/ThreeDots.svelte';
	import BoxArrowUpRight from '../icons/BoxArrowUpRight.svelte';

	export let id: string;
	export let sub: string;
	export let type: UserConnectionType;
	export let username: string | null;
	export let created_at: string;
	export let avatar_url: string | null;
	export let website_url: string | null;
	export let display_name: string | null;

	let trigger: () => void;
	let disconnecting = false;
	const disconnect = async () => {
		disconnecting = true;

       	const response = await removeUserConnection(id);
		if (response.success)
			await invalidateAll();
		else
			alert($t(`request_error.${response.error as 0}`));

		disconnecting = false;
    };
</script>

<div class="user-connection">
	<svelte:component this={USER_CONNECTION_METADATA[type]?.icon} size={32}/>
	{#if avatar_url}
		<img src={avatar_url} alt="" width="32" height="32"/>
	{/if}
	<div class="details">
		<h1>{$t(`user_connection.type.${type}`)}</h1>
		<p>
			{display_name ?? username ?? sub}
			{#if username}
				<!-- yes, this formatting is strange, formatting it normally results in an unwanted space -->
				({#if website_url}
					<a href={website_url} target="_blank">
						@{username}</a>{:else}
					@{username}{/if})
			{/if}
		</p>
	</div>
	<p class="created">{$t('user_connection.created', [created_at])}</p>
	<DropdownMenu.Root bind:trigger>
		<button type="button" class="options" slot="trigger" on:click={trigger}>
			<ThreeDots/>
		</button>
		<a href={USER_CONNECTION_METADATA[type]?.manage_url} target="_blank">
			<BoxArrowUpRight/>{$t(`user_connection.type.${type}.manage`)}
		</a>
		<button type="button" on:click={disconnect} disabled={disconnecting}>
			<X/>{$t('action.disconnect')} {$t(`user_connection.type.${type}`)}
		</button>
	</DropdownMenu.Root>
</div>

<style lang="scss">
	.user-connection {
		height: 64px;
		display: flex;
		padding: 0 28px;
		position: relative;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 32px;
		img {
			border-radius: 50%;
		}
		&:has(img) > :global(svg) {
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
				a {
					color: var(--color-link);
				}
			}
		}
		.created {
			color: var(--color-secondary);
			margin: 0 24px;
			font-size: .8em;
		}
		.options {
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 0;
			background: none;
		}
	}
</style>