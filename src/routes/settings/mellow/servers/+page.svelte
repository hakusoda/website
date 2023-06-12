<script lang="ts">
	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	export let data: PageData;
</script>

<div class="main">
	<h1>{$t('settings.mellow.servers')}</h1>
	<div class="servers">
		{#each data.servers as item}
			<a class="item focusable" href={`/mellow/server/${item.id}/settings`}>
				<Avatar src={item.avatar_url} size="sm"/>
				<div class="name">
					<h1>{item.name}</h1>
					<p>{$t('settings.mellow.servers.server.details', [item.members.length])}</p>
				</div>
			</a>
		{/each}
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 256px 32px 64px;
		.servers {
			gap: 16px;
			display: flex;
			margin-top: 24px;
			flex-direction: column;
			.item {
				display: flex;
				padding: 8px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 8px;
				text-decoration: none;
				.name {
					margin-left: 16px;
					h1 {
						margin: 0;
						font-size: 1.2em;
						font-weight: 600;
					}
					p {
						color: var(--color-secondary);
						margin: 2px 0 0;
						font-size: .8em;
					}
				}
			}
		}
	}
</style>