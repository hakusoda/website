<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

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
	{#if data.links.length}
		<h1>{$t('settings.roblox.verification.list')}</h1>
		<div class="users">
			{#each links as link}
				<RobloxUserLink user={link.target} icon={link.target_icon} link={link}/>
			{/each}
		</div>
	{/if}

	<Button href="/roblox/authorise"><Link/>{$t('settings.roblox.verification.add')}</Button>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 256px 32px 64px;
		.users {
			gap: 8px;
			display: flex;
			margin-top: 24px;
			margin-bottom: 32px;
			flex-direction: column;
		}
	}
</style>