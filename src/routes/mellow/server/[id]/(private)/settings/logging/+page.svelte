<script lang="ts">
	import { Select } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import { hasBit } from '$lib/shared/util';
	import type { RequestError } from '$lib/shared/types';
	import { parse_update_payload } from '$lib/client/util';
	import { update_mellow_server_logging } from '$lib/client/api';
	import { DiscordChannelType, MellowServerLogType } from '$lib/shared/enums';

	import Radio from '$lib/ui/components/Radio.svelte';
	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';
	export let data;

	let channel_id = data.logging_channel_id;
	let event_kinds = data.logging_types;

	let error: RequestError | null = null;
	let saving = false;
	const save = async () => {
		saving = !(error = null);
		const response = await update_mellow_server_logging($page.params.id, parse_update_payload({
			channel_id: data.logging_channel_id,
			event_kinds: data.logging_types
		}, { channel_id, event_kinds }));
		if (response.success)
			data.logging_channel_id = channel_id, data.logging_types = event_kinds;
		else
			error = response;
		saving = false;
	};
	const reset = () => (channel_id = data.logging_channel_id, event_kinds = data.logging_types);

	let enabled: boolean[] = [];
	for (const type of Object.values(MellowServerLogType))
		if (typeof type === 'number' && type)
			enabled[type] = hasBit(event_kinds, type);

	$: {
		let newTypes = 0;
		for (const [type, value] of Object.entries(enabled))
			if (value)
				newTypes += parseInt(type);
		event_kinds = newTypes;
	}
</script>

<p class="input-label">{$t('mellow.server.settings.automation.logging.channel')}</p>
<Select.Root withSearch bind:value={channel_id}>
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
	show={channel_id !== data.logging_channel_id || event_kinds !== data.logging_types}
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