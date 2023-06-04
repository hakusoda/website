<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import RobloxUserLink from '$lib/components/RobloxUserLink.svelte';

	import Link from '$lib/icons/Link.svelte';
	export let data: PageData;
</script>

<div class="main">
	{#if data.links.length}
		<h1>{$t('settings.roblox.verification.list')}</h1>
		<div class="users">
			{#each data.users as user, key}
				<RobloxUserLink user={user} icon={user.icon} link={data.links[key]}/>
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