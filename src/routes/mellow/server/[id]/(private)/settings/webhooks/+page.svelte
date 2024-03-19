<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/shared/util';
	import { MellowWebhookEventType } from '$lib/shared/enums';

	import Plus from 'virtual:icons/bi/plus-lg';
	import Link from 'virtual:icons/bi/link-45deg';
	import Sunrise from 'virtual:icons/bi/sunrise';
	import SendFill from 'virtual:icons/bi/send-fill';
	export let data;

	let itemFilter = '';
	const calculateEvents = ({ events }: { events: number }) => {
		let amount = 0;
		for (const type of Object.values(MellowWebhookEventType))
			if (typeof type === 'number' && type && hasBit(events, type))
				amount++;
		return amount;
	};
</script>

<div class="header">
	<h2>{$t('mellow.server.settings.automation.webhooks')}</h2>
	<p>{$t('mellow.server.settings.automation.webhooks.summary')}</p>
</div>
<div class="controls">
	<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
	<Button>
		<Plus/>{$t('mellow.server.settings.automation.webhooks.create')}
	</Button>
</div>
{#await data.webhooks then items}
	<div class="items">
		{#each items.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item}
			<a class="item" href={`/mellow/server/${$page.params.id}/settings/webhooks/${item.id}`}>
				<div class="info">
					<h1>{item.name}</h1>
					<div class="details">
						<p>
							<Sunrise/>
							{$t('time_ago', [item.created_at])}
							{#if item.creator}
								{$t('label.by')}
								<a href={`/user/${item.creator.username}`}>
									{item.creator.name ?? `@${item.creator.username}`}
								</a>
							{/if}
						</p>
						<p>
							<Link/>
							<a href={item.target_url} target="_blank">
								{item.target_url}
							</a>
						</p>
						<p>
							<SendFill/>
							{$t('label.events', [calculateEvents(item)])}
						</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
{/await}

<style lang="scss">
	.controls {
		gap: 16px;
		display: flex;
		justify-content: space-between;
	}
	.items {
		gap: 16px;
		height: 100%;
		display: flex;
		overflow: auto;
		margin-top: 16px;
		flex-direction: column;
		.item {
			display: flex;
			padding: 0 28px;
			min-height: 80px;
			transition: opacity .5s, box-shadow .5s;
			background: var(--background-secondary);
			box-shadow: inset 0 0 0 1px var(--border-primary);
			align-items: center;
			border-radius: 32px;
			text-decoration: none;
			&:not(:disabled):hover {
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
			.info {
				h1 {
					margin: 0 0 6px;
					font-size: .9em;
					font-weight: 500;
				}
				.details {
					gap: 8px;
					margin: 8px 0 0;
					display: flex;
					p {
						gap: 6px;
						color: var(--color-secondary);
						margin: 0;
						display: flex;
						padding: 4px 10px;
						font-size: .75em;
						box-shadow: 0 0 0 1px var(--border-secondary);
						align-items: center;
						border-radius: 16px;
					}
				}
			}
		}
	}
</style>