<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/util';
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { RobloxLinkFlag, RequestErrorType } from '../enums';
	import type { RobloxLink, RequestError, RobloxUserProfile } from '../types';

	import Avatar from './Avatar.svelte';
	
	import Eye from '../icons/Eye.svelte';
	import Trash from '../icons/Trash.svelte';
	import ThreeDots from '$lib/icons/ThreeDots.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let link: RobloxLink;
	export let user: RobloxUserProfile;
	export let icon: string | undefined = undefined;

	let trigger: () => void;

	let error: RequestError | null = null;
	let unlinking = false;
	const action = async (action: string, body: string = link.id) => {
		error = null;
		unlinking = true;
       	const response = await fetch(action, { body, method: 'POST' });
		const result = deserialize(await response.text());
		if (result.type === 'success')
			return invalidateAll();
		else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline } satisfies RequestError;
		unlinking = false;
    };

	$: isPrimary = link.id === $page.data.primaryId;
</script>

<div class="user-link" class:active={isPrimary}>
	<Avatar id={user.userId.toString()} src={icon} size="xs" circle/>
	<div class="details">
		<h1>
			{user.names.combinedName}
			{#if isPrimary}
				<span class="primary">{$t('roblox_link.primary')}</span>
			{/if}
		</h1>
		<p>
			@{user.names.username}
			{#if link.public}
				• {$t('roblox_link.visible')}
			{/if}
		</p>
	</div>
	<div class="verified">
		{$t(`roblox_link.verified.${hasBit(link.flags, RobloxLinkFlag.Verified)}`)}
	</div>
	<DropdownMenu.Root bind:trigger>
		<button type="button" class="options" slot="trigger" on:click={trigger}>
			<ThreeDots/>
		</button>
		<p>{user.names.combinedName} (@{user.names.username})</p>
		<a href={`https://roblox.com/users/${user.userId}/profile`} target="_blank">
			<BoxArrowUpRight/>{$t('roblox_link.view')}
		</a>
		<div class="separator"/>
		{#if !isPrimary}
			<button type="button" on:click={() => action('?/setPrimary')} disabled={isPrimary}>
				{$t('roblox_link.make_primary')}
			</button>
		{/if}
		<button type="button" on:click={() => action('?/changeVisibility', `${link.id}:${!link.public}`)}>
			<Eye/>{$t(`roblox_link.change_visibility.${link.public}`)}
		</button>
		<button type="button" on:click={() => action('?/unlink')}>
			<Trash/>{$t('roblox_link.delete')}
		</button>
	</DropdownMenu.Root>
</div>

<style lang="scss">
	.user-link {
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
				.primary {
					color: hsl(330 65% 75%);
					font-size: .8em;
					margin-left: 4px;
				}
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: .8em;
			}
		}
		.verified {
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