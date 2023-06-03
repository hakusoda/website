<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';
	import { RobloxLinkFlag } from '$lib/enums';

	import Avatar from '$lib/components/Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import Link from '$lib/icons/Link.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;
</script>

<div class="main">
	{#if data.links.length}
		<h1>{$t('settings.roblox.verification.list')}</h1>
		<div class="users">
			{#each data.users as user, key}
				<a href={`https://roblox.com/users/${user.id}/profile`}>
					<Avatar src={user.icon} size="sm" circle/>
					<div class="name">
						<p class="nickname">{user.displayName}</p>
						<div class="flags">
							{#if data.links[key].flags}
								{#each Object.values(RobloxLinkFlag) as flag}
									{#if typeof flag === 'number' && flag && (data.links[key].flags & flag) === flag}
										<p class="flag"><Check/>{$t(`roblox_link_flag.${flag}`)}</p>
									{/if}
								{/each}
							{:else}
								<p class="flag"><X/>{$t(`roblox_link_flag.0`)}</p>
							{/if}
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	<Button href="/roblox/authorise"><Link/>{$t('settings.roblox.verification.add')}</Button>
</div>

<style lang="scss">
	.main {
		margin: 64px auto;
		.users {
			gap: 8px;
			display: flex;
			margin-top: 24px;
			margin-bottom: 32px;
			flex-direction: column;
			a {
				gap: 16px;
				width: 100%;
				display: flex;
				padding: 8px 16px 8px 8px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 8px;
				text-decoration: none;
				.name {
					.nickname {
						margin: 0 0 2px;
						font-size: 1.1em;
						font-weight: 500;
					}
					.flags {
						gap: 8px;
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
			}
		}
	}
</style>