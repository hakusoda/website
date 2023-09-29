<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { invalidateAll } from '$app/navigation';
	import { PUBLIC_GITHUB_ID } from '$env/static/public';
	import { removeUserConnection } from '../api';
	import type { UserConnectionType } from '../enums';
	import { USER_CONNECTION_METADATA } from '../constants';

	import X from '../icons/X.svelte';
	import ThreeDots from '../icons/ThreeDots.svelte';
	import BoxArrowUpRight from '../icons/BoxArrowUpRight.svelte';

	export let id: string;
	export let sub: string;
	export let type: UserConnectionType;
	export let metadata: any;
	export let created_at: string;

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
	<svelte:component this={USER_CONNECTION_METADATA[type].icon} size={32}/>
	<div class="details">
		<h1>{$t(`user_connection.type.${type}`)}</h1>
		<p>
			{metadata?.global_name ?? metadata?.name}
			(<a href={metadata?.html_url ?? `https://discord.com/users/${sub}`}>
				@{metadata?.login ?? metadata?.username}</a>)
		</p>
	</div>
	<p class="created">{$t('user_connection.created', [created_at])}</p>
	<DropdownMenu.Root bind:trigger>
		<button type="button" class="options" slot="trigger" on:click={trigger}>
			<ThreeDots/>
		</button>
		<a href={type ? `https://github.com/settings/connections/applications/${PUBLIC_GITHUB_ID}` : 'https://discord.com/settings/authorized-apps'} target="_blank">
			<BoxArrowUpRight/>{$t(`user_connection.type.${type}.manage`)}
		</a>
		<button type="button" on:click={disconnect}>
			<X/>{$t('action.disconnect')} {$t(`user_connection.type.${type}`)}
		</button>
	</DropdownMenu.Root>
</div>

<style lang="scss">
	.user-connection {
		height: 64px;
		display: flex;
		padding: 0 28px;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 32px;
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