<script lang="ts">
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { RobloxLinkFlag } from '../enums';
	import type { RobloxLink, RobloxUser } from '../types';

	import Avatar from './Avatar.svelte';

	import X from '../icons/X.svelte';
	import Eye from '../icons/Eye.svelte';
	import Check from '../icons/Check.svelte';
	import Trash from '../icons/Trash.svelte';
	import CaretDown from '../icons/CaretDown.svelte';
	import RobloxIcon from '../icons/RobloxIcon.svelte';
	export let icon: string;
	export let link: RobloxLink;
	export let user: RobloxUser;

	let trigger: () => void;

	let error = '';
	let unlinking = false;
	const action = async (event: Event, body: string = link.id) => {
		error = '';
		unlinking = true;
       	const response = await fetch((event.target as HTMLFormElement).action, {
			body,
            method: 'POST'
        });
		if (response.status === 200)
			return location.reload();
		unlinking = !(error = response.statusText);
    };
</script>

<DropdownMenu bind:trigger>
	<button slot="trigger" type="button" class="user-link" on:click={trigger} disabled={unlinking}>
		<Avatar src={icon} size="sm" circle/>
		<div class="name">
			<p class="nickname">{user.displayName}</p>
			<div class="flags">
				{#if link.flags}
					{#each Object.values(RobloxLinkFlag) as flag}
						{#if typeof flag === 'number' && flag && (link.flags & flag) === flag}
							<p class="flag"><Check/>{$t(`roblox_link.flag.${flag}`)}</p>
						{/if}
					{/each}
				{:else}
					<p class="flag"><X/>{$t(`roblox_link.flag.0`)}</p>
				{/if}
				<p class="flag"><Eye/>{$t(`roblox_link.visible.${link.public}`)}</p>
			</div>
		</div>
		<div class="button">
			<CaretDown/>
		</div>
	</button>
	<p>{user.displayName} (@{user.name})</p>
	<a href={`https://roblox.com/users/${user.id}/profile`} target="_blank">
		<RobloxIcon/>{$t('roblox_link.view')}
	</a>
	<div class="separator"/>
	<form method="POST" action="?/changeVisibility" on:submit|preventDefault={e => action(e, `${link.id}:${!link.public}`)}>
		<button>
			<Eye/>{$t(`roblox_link.change_visibility.${link.public}`)}
		</button>
	</form>
	<form method="POST" action="?/unlink" on:submit|preventDefault={action}>
		<button>
			<Trash/>{$t('roblox_link.delete')}
		</button>
	</form>
</DropdownMenu>
{#if error}
	<p>{error}</p>
{/if}

<style lang="scss">
	:global(.users .container) {
		width: 100% !important;
	}
	.user-link {
		gap: 16px;
		width: 100%;
		color: var(--color-primary);
		border: none;
		cursor: pointer;
		display: flex;
		padding: 8px 16px 8px 8px;
		font-size: 1em;
		text-align: start;
		background: var(--background-secondary);
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 8px;
		text-decoration: none;
		.name {
			.nickname {
				margin: 0 0 2px;
				font-size: 1.1em;
				font-weight: 500;
			}
			.flags {
				gap: 16px;
				display: flex;
				.flag {
					gap: 4px;
					color: var(--color-secondary);
					margin: 0;
					display: flex;
					font-size: .8em;
					align-items: end;
				}
			}
		}
		.button {
			color: var(--color-tertiary);
			margin: 0 8px 0 auto;
		}
		&[disabled] {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}
</style>