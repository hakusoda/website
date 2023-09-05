<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import MellowAd from '$lib/components/MellowAd.svelte';
	import RobloxUserLink from '$lib/components/RobloxUserLink.svelte';

	import Link from '$lib/icons/Link.svelte';
	export let data: PageData;

	$: links = data.links.map(link => ({
		...link,
		target: data.users.find(u => u.id === link.target_id)!,
		target_icon: data.icons.find(i => i.targetId === link.target_id)!.imageUrl
	}));
</script>

<div class="main">
	<h1>{$t('settings.roblox.accounts.list')}</h1>
	<p class="help">{$t('settings.roblox.accounts.help')}</p>
	{#if data.links.length}
		<div class="users">
			{#each links as link}
				<RobloxUserLink user={link.target} icon={link.target_icon} link={link}/>
			{/each}
		</div>
	{/if}

	<Button href="/roblox/authorise"><Link/>{$t('settings.roblox.accounts.add')}</Button>
	{#if data.mellow}
		<p class="mellow">{$t('settings.roblox.accounts.mellow')}</p>
	{:else}
		<MellowAd/>
	{/if}
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0 64px 32px;
		.help {
			color: var(--color-secondary);
			font-size: .9em;
		}
		.users {
			gap: 8px;
			display: flex;
			margin-top: 24px;
			margin-bottom: 32px;
			flex-direction: column;
		}
		.mellow {
			color: #fff;
			padding: 16px 24px;
			animation: .5s infinite alternate basic-focus;
			margin-top: 32px;
			background: 100% center url('/img/mellow-banner.svg');
			font-weight: 500;
			line-height: 1.25;
			border-radius: 20px;
		}
	}
</style>