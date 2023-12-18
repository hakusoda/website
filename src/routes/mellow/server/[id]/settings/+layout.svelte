<script lang="ts">
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';

	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import Link from '$lib/icons/Link.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import Webhook from '$lib/icons/Webhook.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import Newspaper from '$lib/icons/Newspaper.svelte';
	import CodeSlash from '$lib/icons/CodeSlash.svelte';

	$: base = `/mellow/server/${$page.params.id}/settings`;
	$: items = [
		[base, GearFill, 'mellow.server.settings.0'],
		[`${base}/syncing`, Link, 'mellow.server.settings.2'],
		[`${base}/action-log`, Newspaper, 'mellow.server.settings.4'],
		'mellow.server.settings.automation',
		[`${base}/logging`, Discord, 'mellow.server.settings.1'],
		[`${base}/api`, CodeSlash, 'mellow.server.settings.api'],
		[`${base}/webhooks`, Webhook, 'mellow.server.settings.3']
	];
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('mellow.server.settings')}</h1>
	</div>
</div>
<WithSideNavigation {items}>
	<slot/>
</WithSideNavigation>