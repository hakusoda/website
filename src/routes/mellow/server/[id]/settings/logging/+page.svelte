<script lang="ts">
	import { Select, Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { hasFlag } from '$lib/util';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import type { RequestError } from '$lib/types';
	import { RequestErrorType, DiscordChannelType, MellowServerLogType } from '$lib/enums';

	import Check from '$lib/icons/Check.svelte';
	import Radio from '$lib/components/Radio.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	const save = async () => {
		saving = !(error = null);
		const response = await fetch('?/edit', {
			body: JSON.stringify({
				types : types === data.logging_types ? undefined : types,
				channel: channel === data.logging_channel_id ? undefined : channel,
				channel_name: channel === data.logging_channel_id ? undefined : channel ? `#${data.channels.find(c => c.id === channel)?.name}` : null
			}),
            method: 'POST'
        });
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			location.reload();
		} else if (result.type === 'failure')
			saving = !(error = result.data as any);
		else if (result.type === 'error')
			saving = !(error = { error: RequestErrorType.Offline });
	};

	let channel = data.logging_channel_id;

	let types = data.logging_types;
	let enabled: boolean[] = [];
	for (const type of Object.values(MellowServerLogType))
		if (typeof type === 'number' && type)
			enabled[type] = hasFlag(types, type);

	$: {
		let newTypes = 0;
		for (const [type, value] of Object.entries(enabled))
			if (value)
				newTypes += parseInt(type);
		types = newTypes;
	}
</script>

<div class="main">
	<p class="input-label">{$t('mellow.server.settings.logging.channel')}</p>
	<Select.Root bind:value={channel}>
		<Select.Item value={null}>
			{$t('label.disabled')}
		</Select.Item>
		<p>{$t('mellow.server.settings.logging.channel.category')}</p>
		{#each data.channels.sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0)) as item}
			{#if item.type === DiscordChannelType.GuildText}
				<Select.Item value={item.id}>
					#{item.name}
				</Select.Item>
			<!--{:else if item.type === DiscordChannelType.GuildCategory}
				<p>{item.name}</p>-->
			{/if}
		{/each}
	</Select.Root>

	<p class="input-label">{$t('mellow.server.settings.logging.types')}</p>
	<div class="types">
		{#each Object.values(MellowServerLogType) as item}
			{#if typeof item === 'number' && item}
				<div class="item">
					<Radio bind:value={enabled[item]}/>
					<p>{$t(`mellow_server_logging_type.${item}`)}</p>
				</div>
			{/if}
		{/each}
	</div>

	<RequestErrorUI data={error} background="var(--background-primary)"/>
	<div class="buttons">
		<Button on:click={save} disabled={saving || (types === data.logging_types && channel === data.logging_channel_id)}>
			<Check/>{$t('action.save_changes')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 32px 0 32px 64px;
		.input-label {
			color: var(--color-secondary);
			margin: 32px 0 8px;
			font-size: .9em;
		}
		.types {
			gap: 8px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				align-items: center;
				p {
					margin: 0;
					font-size: .9em;
					margin-left: 16px;
				}
			}
		}
		.buttons {
			margin-top: 24px;
		}
	}
</style>