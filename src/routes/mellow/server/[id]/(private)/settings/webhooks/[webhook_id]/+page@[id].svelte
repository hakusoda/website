<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/shared/util';
	import { MellowWebhookEventType } from '$lib/shared/enums';
	import { update_mellow_server_webhook } from '$lib/client/api';
	import { editor, set_editor_callback } from '$lib/client/store';

	import Radio from '$lib/ui/components/Radio.svelte';
	import WithSideNavigation from '$lib/ui/layouts/WithSideNavigation.svelte';

	import Webhook from '$lib/ui/icons/Webhook.svelte';
    import { goto } from '$app/navigation';
	export let data;

	const EVENTS = Object.values(MellowWebhookEventType)
		.filter(item => item && typeof item === 'number') as MellowWebhookEventType[];
	$: webhook = data.webhooks.find(item => item.id === $page.params.webhook_id);

	let name = '';
	let events = 0;
	let enabled = true;
	let target_url = '';

	const reset = () => (name = webhook!.name, events = webhook!.events, enabled = webhook!.enabled, target_url = webhook!.target_url);
	$: if (webhook)
		reset();

	$: editor.canSave.set(name !== webhook?.name || events !== webhook?.events || enabled !== webhook?.enabled || target_url !== webhook?.target_url);
	set_editor_callback(async () => {
		const response = await update_mellow_server_webhook($page.params.id, $page.params.webhook_id, {
			name,
			events,
			enabled,
			target_url
		});
		if (response.success)
			await goto(`/mellow/server/${$page.params.id}/settings/webhooks`, { invalidateAll: true });
	});
</script>

<WithSideNavigation items={data.webhooks.map(item => [`/mellow/server/${$page.params.id}/settings/webhooks/${item.id}`, Webhook, item.name])}>
	{#if webhook}
		<div class="mellow-webhooks" style="display: contents">
			<p class="input-label">{$t('profile.name')}</p>
			<TextInput bind:value={name}/>
	
			<p class="input-label">Payload URL</p>
			<TextInput bind:value={target_url}/>

			<div class="divider"/>
	
			<p class="input-label">Events</p>
			<div class="events">
				{#each EVENTS as item}
					{#if typeof item === 'number'}
						<div>
							<Radio
								value={hasBit(events, item)}
								onChange={() => events ^= item}
							/>
							<p>{$t(`mellow_webhook_event.${item}`)}</p>
						</div>
					{/if}
				{/each}
			</div>

			<div class="divider"/>

			<p class="input-label">Other Settings</p>
			<div class="radio-group">
				<Radio bind:value={enabled}/>
				<p>Active</p>
			</div>
		</div>
	{/if}
</WithSideNavigation>

<style lang="scss">
	.mellow-webhooks {
		:global(.text-input) {
			min-width: 100% !important;
		}
		.input-label:first-child {
			margin-top: 0;
		}
		.divider {
			width: 100%;
			height: 1px;
			margin: 32px 0;
			background: var(--border-primary);
		}
	}
	.events {
		gap: 8px;
		display: flex;
		flex-direction: column;
	}
	.events div, .radio-group {
		display: flex;
		align-items: center;
		p {
			margin: 0 0 0 16px;
			font-size: .9em;
		}
	}
</style>