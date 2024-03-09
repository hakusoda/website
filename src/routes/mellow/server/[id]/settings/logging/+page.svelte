<script lang="ts">
	import { Select } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { hasBit } from '$lib/shared/util';
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import type { RequestError } from '$lib/shared/types';
	import { RequestErrorType, DiscordChannelType, MellowServerLogType } from '$lib/shared/enums';

	import Radio from '$lib/ui/components/Radio.svelte';
	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';
	export let data;

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
			await invalidateAll();
		} else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline };
		saving = false;
	};
	const reset = () => (types = data.logging_types, channel = data.logging_channel_id);

	let channel = data.logging_channel_id;

	let types = data.logging_types;
	let enabled: boolean[] = [];
	for (const type of Object.values(MellowServerLogType))
		if (typeof type === 'number' && type)
			enabled[type] = hasBit(types, type);

	$: {
		let newTypes = 0;
		for (const [type, value] of Object.entries(enabled))
			if (value)
				newTypes += parseInt(type);
		types = newTypes;
	}
</script>

<p class="input-label">{$t('mellow.server.settings.automation.logging.channel')}</p>
<Select.Root bind:value={channel}>
	<Select.Item value={null}>
		{$t('label.disabled')}
	</Select.Item>
	<p>{$t('mellow.server.settings.automation.logging.channel.category')}</p>
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

<p class="input-label">{$t('mellow.server.settings.automation.logging.types')}</p>
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

<UnsavedChanges
	show={types !== data.logging_types || channel !== data.logging_channel_id}
	error={error ? $t(`request_error.${error.error}`) : ''}
	{save}
	{reset}
	{saving}
/>

<style lang="scss">
	.input-label {
		color: var(--color-secondary);
		margin: 32px 0 8px;
		font-size: .9em;
		&:first-child {
			margin-top: 0;
		}
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
</style>