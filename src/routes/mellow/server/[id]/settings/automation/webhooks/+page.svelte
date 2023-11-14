<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import type { PageData } from './$types';
	import { MellowWebhookEventType } from '$lib/enums';

	import Plus from '$lib/icons/Plus.svelte';
	import Link from '$lib/icons/Link.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import SendFill from '$lib/icons/SendFill.svelte';
	import PencilFill from '$lib/icons/PencilFill.svelte';
	export let data: PageData;

	let itemFilter = '';
	const calculateEvents = ({ events }: PageData['webhooks'][number]) => {
		let amount = 0;
		for (const type of Object.values(MellowWebhookEventType))
			if (typeof type === 'number' && type && hasBit(events, type))
				amount++;
		return amount;
	};
</script>

<div class="main">
	<h1>{$t('mellow.server.settings.automation.webhooks')}</h1>
	<h2>{$t('mellow.server.settings.automation.webhooks.summary')}</h2>
	<div class="items">
		{#each data.webhooks.filter(item => item.name.toLowerCase().includes(itemFilter.toLowerCase())) as item}
			<div class="item">
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
							{item.request_method}
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
				<div class="buttons">
					<Button disabled>
						<PencilFill/>{$t('action.edit')}
					</Button>
					<Button colour="secondary" circle disabled>
						<Trash/>
					</Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="fade"/>
	<div class="buttons">
		<Button disabled>
			<Plus/>{$t('mellow.server.settings.automation.webhooks.create')}
		</Button>
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<!--<Select.Root bind:value={$mellowLinkViewMode}>
			{#each Object.values(MellowLinkListViewMode) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_sync_action.view_mode.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>-->
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0px 64px 32px;
		display: flex;
		position: relative;
		flex-direction: column;
		h1 {
			margin: 24px 0 16px;
		}
		h2 {
			color: var(--color-secondary);
			margin: 0 0 16px;
			font-size: .9em;
			font-weight: 400;
		}
		.items {
			gap: 16px;
			height: 100%;
			display: flex;
			padding: 16px 0;
			overflow: auto;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 16px 16px 20px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 24px;
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
				.buttons {
					gap: 16px;
					display: flex;
					margin-left: auto;
				}
			}
		}
		.fade {
			left: 0;
			width: 100%;
			bottom: 48px;
			height: 32px;
			position: absolute;
			background: linear-gradient(to bottom, transparent, var(--background-primary));
		}
		& > .buttons {
			gap: 16px;
			margin: 16px 0 0;
			display: flex;
			:global(input) {
				margin-left: auto;
			}
		}
	}
</style>