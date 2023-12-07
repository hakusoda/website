<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';

	import Link from '$lib/icons/Link.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import Webhook from '$lib/icons/Webhook.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';

	const paths = [{
		icon: GearFill,
		path: ''
	}, {
		icon: Discord,
		path: '/logging'
	}, {
		icon: Link,
		path: '/syncing'
	}, {
		icon: Webhook,
		path: '/webhooks'
	}, {
		icon: Newspaper,
		path: '/action-log'
	}];
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('mellow.server.settings')}</h1>
	</div>
</div>
<div class="settings geist">
	<div class="navigation">
		{#each paths as path, index}
			<a href={`/mellow/server/${$page.params.id}/settings${path.path}`} class:active={$page.url.pathname.endsWith(`/settings${path.path}`)}>
				<svelte:component this={path.icon}/>
				{$t(`mellow.server.settings.${index}`)}
			</a>
		{/each}
	</div>
	<div class="content">
		<slot/>
	</div>
</div>

<style lang="scss">
	.settings {
		display: flex;
		margin-top: 64px;
		.navigation {
			gap: 16px;
			top: 128px;
			width: 256px;
			height: fit-content;
			display: flex;
			position: sticky;
			flex-direction: column;
			a {
				gap: 12px;
				color: hsl(250 20% 90% / 80%);
				display: flex;
				font-size: 13px;
				transition: color .1s;
				align-items: center;
				&.active, &:hover {
					color: var(--menu-color-hover);
					text-decoration: none;
				}
			}
		}
		.content {
			width: 100%;
			margin-left: 16px;
			& > :global(.header) {
				margin-bottom: 32px;
				:global(h2) {
					margin: 0;
					font-weight: 600;
				}
				:global(p) {
					color: var(--color-secondary);
					margin: 16px 0 0;
					font-size: .9em;
				}
			}
		}
	}
</style>