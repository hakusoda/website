<script lang="ts">
	import type { GroupRole } from '@hakumi/roblox-open-cloud';
	import { Button, Select, TextInput, NumberInput, ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { use_roblox_group_roles } from '$lib/client/store';
	import { UserConnectionKind } from '$lib/shared/enums';
	import { clone_json, are_json_equal } from '$lib/shared/util';
	import { QUANTIFIER_KINDS, SYNC_ACTION_ICONS, SYNC_ACTION_KINDS, UI_CRITERIA_ITEM_LIST, create_action_data, create_criteria_item, get_criteria_item_icon } from '$lib/client/model/mellow/syncing';
	import { parse_update_payload } from '$lib/client/util';
	import { editor, set_editor_callback } from '$lib/client/store';
	import { create_mellow_sync_action, update_mellow_sync_action, send_mellow_syncing_auto_import_request, get_roblox_group_roles_for_mellow_server } from '$lib/client/api';
	import { USER_CONNECTION_METADATA } from '$lib/shared/constants';
	import type { 
		AutoImportRequest, AutoImportItem,
		SyncAction, SyncActionKind,
		CriteriaItemKind,
		InternalSyncAction
	} from '$lib/shared/types/mellow/syncing';

	import Modal from '$lib/ui/components/Modal.svelte';
	import Radio from '$lib/ui/components/Radio.svelte';
	import Loader from '$lib/ui/components/Loader.svelte';
	import GroupSelect from '$lib/ui/components/GroupSelect.svelte';
	import AutoImportListItem from '$lib/ui/components/mellow/syncing/AutoImportItem.svelte';
	import WithSideNavigation from '$lib/ui/layouts/WithSideNavigation.svelte';
	import PageSlider from '$lib/ui/components/PageSlider.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Link from 'virtual:icons/bi/link-45deg';
	import Plus from 'virtual:icons/bi/plus-lg';
	import GridFill from 'virtual:icons/bi/grid-fill';
	import Clipboard from 'virtual:icons/bi/clipboard';
	import ArrowLeft from 'virtual:icons/bi/arrow-left';
	import UIChecksGrid from 'virtual:icons/bi/ui-checks-grid';
	import CloudArrowDownFill from 'virtual:icons/bi/cloud-arrow-down-fill';
	export let data;

	$: server_id = $page.params.id;
	$: selected_action = data.items.find(item => item.id === $page.params.action_id);

	const cloneId = $page.url.searchParams.get('clone_from_id');
	const toClone = cloneId ? data.items.find(item => item.id === cloneId) : undefined;

	const default_action: SyncAction = {
		kind: 'discord.member.assign_roles',
		criteria: {
			items: [],
			quantifier: {
				kind: 'all'
			}
		},
		action_data: create_action_data('discord.member.assign_roles') as any,
		display_name: ''
	};

	let sync_action = clone_json(default_action) as SyncAction;
	const apply_action = (action?: InternalSyncAction) => {
		if (action)
			sync_action = {
				kind: action.kind as any,
				criteria: clone_json(action.criteria),
				action_data: clone_json(action.action_data),
				display_name: action.display_name
			}
		else
			sync_action = clone_json(default_action);
	};
	$: apply_action(selected_action ?? toClone);

	let last_kind: SyncActionKind = sync_action.kind;
	$: if (sync_action.kind !== last_kind)
		(sync_action.action_data = create_action_data(sync_action.kind), last_kind = sync_action.kind);

	let itemRefs: HTMLDivElement[] = [];
	let lastItemRefLength = 0;
	$: {
		const length = itemRefs.filter(item => item).length;
		if (length > lastItemRefLength)
			itemRefs.findLast(item => item)?.scrollIntoView({ block: 'nearest' });
		lastItemRefLength = length;
	}

	const add_criteria_item = (kind: CriteriaItemKind) =>
		sync_action.criteria.items = [...sync_action.criteria.items, create_criteria_item(kind)];

	$: roles = [...data.roles, ...(sync_action.kind === 'discord.member.assign_roles' ? sync_action.action_data.role_ids.filter(i => !data.roles.some(k => k.id === i)).map(i => ({ id: i, name: 'Unknown Role', icon: null })) : [])];

	$: editor.canSave.set(!selected_action || sync_action.kind !== selected_action.kind || !are_json_equal(sync_action.criteria, selected_action.criteria) || !are_json_equal(sync_action.action_data, selected_action.action_data));
	set_editor_callback(async () => {
		const response = selected_action ?
			await update_mellow_sync_action($page.params.id, selected_action.id, parse_update_payload(selected_action, sync_action)) :
			await create_mellow_sync_action($page.params.id, sync_action);
		if (response.success) {
			if (selected_action)
				data.items = data.items.map(item => item.id === selected_action.id ? response.data : item);
			else {
				data.items = [...data.items, response.data];
				await goto(`/mellow/server/${$page.params.id}/syncing/actions/${response.data.id}`);
			}
		}
	});

	$: navigation_items = [
		[`/mellow/server/${$page.params.id}/syncing/actions/create`, Plus, 'action.create_new'],
		[auto_import_trigger, CloudArrowDownFill, 'mellow_sync_action_editor.auto_import'],
		'space',
		...data.items.map(item => [`/mellow/server/${$page.params.id}/syncing/actions/${item.id}`, Link, item.display_name])
	] as any[];

	$: roblox_group_roles = use_roblox_group_roles(server_id, sync_action.criteria.items.flatMap(item => 
		item.kind === 'roblox.group.membership.role' && item.group_id ? [item.group_id] : []
	));

	let create_criteria_item_trigger: () => void;

	let auto_import_request: AutoImportRequest | null = null;
	let auto_import_request_roles: GroupRole[] = [];
	let auto_import_request_active_items: boolean[] = [];
	let auto_import_trigger: () => void;
	let auto_import_group_id: string | null = null;
	let auto_import_requesting = false;
	const m = async () => {
		auto_import_requesting = true;

		const response = await get_roblox_group_roles_for_mellow_server($page.params.id, auto_import_group_id!);
		if (response.success) {
			const id = parseInt(auto_import_group_id!);
			const roles = response.data.filter(item => item.rank > 0);
			const items: AutoImportItem[] = [];
			auto_import_request_roles = roles;

			for (const role of roles) {
				let closest_discord_role: typeof data['roles'][number] | null = null;
				for (const discord_role of data.roles) {
					if (role.displayName === discord_role.name) {
						closest_discord_role = discord_role;
						break;
					} else if (discord_role.name.trim().toLowerCase().includes(role.displayName.trim().toLowerCase()))
						closest_discord_role = discord_role;
				}

				items.push({
					kind: 'roblox.group.role',
					role_id: parseInt(role.id),
					group_id: id,
					discord_role: closest_discord_role ? {
						kind: 'use_existing',
						role_id: closest_discord_role.id
					} : {
						kind: 'create_new',
						name: role.displayName
					},
					display_name: role.displayName
				});
			}

			auto_import_request_active_items = items.map(() => true);
			auto_import_request = {
				items
			};
		}
		auto_import_requesting = false;
	};
	const ms = async () => {
		auto_import_requesting = true;
		const response = await send_mellow_syncing_auto_import_request($page.params.id, {
			items: auto_import_request!.items.filter((_,index) => auto_import_request_active_items[index])
		});
		if (response.success) {
			auto_import_group_id = auto_import_request = null;
			auto_import_request_roles = [];
			auto_import_request_active_items = [];

			data.items = [...data.items, ...response.data];
			auto_import_trigger();
		}

		auto_import_requesting = false;
	};
</script>

<Modal bind:trigger={auto_import_trigger}>
	<PageSlider position={auto_import_request ? 1 : 0}>
		<div class="content pre_auto_import_request">
			<GroupSelect source="roblox" bind:value={auto_import_group_id}/>
			<button class="top_button" type="button" on:click={auto_import_trigger}>
				<X/>
			</button>
		</div>
		<div class="content auto_import_request">
			<div class="header">
				<div>
					<h2>{$t('mellow_sync_action_editor.auto_import.create.header')}</h2>
					<p>{$t('group_select.results', [auto_import_request?.items.length])}</p>
				</div>
				<button class="top_button" type="button" on:click={() => (auto_import_request = null, auto_import_request_roles = [], auto_import_request_active_items = [])}>
					<ArrowLeft/>
				</button>
				<button class="top_button" type="button" on:click={() => (auto_import_trigger(), auto_import_request = auto_import_group_id = null, auto_import_request_roles = [], auto_import_request_active_items = [])}>
					<X/>
				</button>
			</div>
			{#if auto_import_request}
				<div class="items">
					{#each auto_import_request.items as item, index}
						<AutoImportListItem
							{item}
							bind:active={auto_import_request_active_items[index]}
							disabled={auto_import_requesting}
							roblox_role={auto_import_request_roles.find(role => role.id === item.role_id.toString())}
							discord_roles={data.roles}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</PageSlider>
	{#if auto_import_request}
		<div class="footer">
			<div>
				<h2>{$t('mellow_sync_action_editor.auto_import.create')}</h2>
				<p>{$t('mellow_sync_action_editor.auto_import.create.note')}</p>
			</div>
			<button type="button" on:click={ms} disabled={auto_import_requesting}>
				{$t('action.confirm')}
			</button>
		</div>
	{:else}
		<div class="footer">
			<div>
				<h2>{$t('mellow_sync_action_editor.auto_import.start')}</h2>
				<p>{$t('mellow_sync_action_editor.auto_import.start.note')}</p>
			</div>
			<button type="button" on:click={() => m()} disabled={!auto_import_group_id || auto_import_requesting}>
				{$t('action.continue')}
			</button>
		</div>
	{/if}
</Modal>

<WithSideNavigation items={navigation_items}>
	{@const kind = sync_action.kind}
	<div class="mellow-action">
		<div class="left">
			<p class="input-label">{$t('profile.name')}</p>
			<TextInput bind:value={sync_action.display_name} placeholder={$t('label.required')}/>

			<div class="divider"/>

			<div class="fields">
				<div class="field">
					<p class="input-label">{$t('mellow_sync_action_editor.kind')}</p>
					<Select.Root bind:value={sync_action.kind}>
						<p>{$t('mellow_sync_action_editor.kind.category')}</p>
						{#each SYNC_ACTION_KINDS as item}
							<Select.Item value={item}>
								<svelte:component this={SYNC_ACTION_ICONS[item]}/>
								{$t(`mellow_sync_action.kind.${item}`)}
							</Select.Item>
						{/each}
					</Select.Root>
				</div>
			</div>

			<div class="divider"/>

			{#if kind === 'discord.member.assign_roles'}
				<div class="fields">
					<div class="field roles">
						<p class="input-label">{$t('mellow_sync_action_editor.kind.discord.member.assign_roles.roles')}</p>
						<Select.Root withSearch bind:values={sync_action.action_data.role_ids} placeholder={$t('label.select_one_or_more')}>
							<p>{$t('mellow_sync_action_editor.kind.discord.member.assign_roles.roles.category')}</p>
							{#each roles as item}
								<Select.Item value={item.id}>
									{#if item.icon}
										<img src={`https://cdn.discordapp.com/role-icons/${item.id}/${item.icon}.png?size=32`} alt="icon" class="role_icon" width="16" height="16"/>
									{/if}
									{item.name}
								</Select.Item>
							{/each}
						</Select.Root>
					</div>
				</div>
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.advanced')}</p>
						<div class="radio-field">
							<Radio bind:value={sync_action.action_data.can_remove}/>
							<p>{$t('mellow_sync_action.kind.discord.member.assign_roles.removable')}</p>
						</div>
					</div>
				</div>
			{:else if kind === 'control_flow.cancel' || kind === 'discord.member.ban' || kind === 'discord.member.kick'}
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.audit_reason')}</p>
						<TextInput bind:value={sync_action.action_data.reason} placeholder={$t('label.optional')}/>
					</div>
				</div>
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.user_reason')}</p>
						<TextInput bind:value={sync_action.action_data.user_facing_details} placeholder={$t('label.optional')}/>
					</div>
				</div>
			{/if}
		</div>
		<div class="right">
			<p class="input-label">{$t('mellow_sync_action_editor.criteria')}</p>
			<div class="fields">
				<Select.Root bind:value={sync_action.criteria.quantifier.kind}>
					{#each QUANTIFIER_KINDS as item}
						<Select.Item value={item}>
							{#if item === 'at_least'}
								<UIChecksGrid/>
							{:else}
								<GridFill/>
							{/if}
							{$t(`mellow_sync_action.criteria.quantifier.kind.${item}`)}
						</Select.Item>
					{/each}
				</Select.Root>
				<Button on:click={create_criteria_item_trigger}>
					<Plus/>{$t('action.create_new')}
				</Button>
			</div>

			<div class="criteria_items">
				{#each sync_action.criteria.items as item, index}
					{@const kind = item.kind}
					<div class="item" class:highlighted={index === sync_action.criteria.items.length - 1} bind:this={itemRefs[index]}>
						<div class="rfields">
							<p class="title">
								<svelte:component this={get_criteria_item_icon(kind)}/>
								{$t(`mellow_sync_action.criteria.item.kind.${kind}`)}
							</p>
							{#if kind === 'hakumi.user.connection'}
								<Select.Root bind:value={item.connection_kind}>
									{#each Object.values(UserConnectionKind) as connection_kind}
										{#if typeof connection_kind === 'number'}
											<Select.Item value={connection_kind}>
												<svelte:component this={USER_CONNECTION_METADATA[connection_kind]?.icon}/>
												{$t(`user_connection.type.${connection_kind}`)}
											</Select.Item>
										{/if}
									{/each}
								</Select.Root>
							{:else if kind === 'mellow.server.syncing.actions'}
								<div class="fields">
									<Select.Root bind:value={item.quantifier.kind}>
										{#each QUANTIFIER_KINDS as item}
											<Select.Item value={item}>
												{#if item === 'at_least'}
													<UIChecksGrid/>
												{:else}
													<GridFill/>
												{/if}
												{$t(`mellow_sync_action.criteria.quantifier.kind.${item}`)}
											</Select.Item>
										{/each}
									</Select.Root>
									<Select.Root withSearch bind:values={item.action_ids} placeholder={$t('label.select_one_or_more')}>
										<p>{$t('mellow_sync_action_editor.kind.category')}</p>
										{#each data.items.filter(item => item.id !== selected_action?.id).sort((a, b) => a.display_name.localeCompare(b.display_name)) as item}
											<Select.Item value={item.id}>
												{item.display_name}
											</Select.Item>
										{/each}
									</Select.Root>
								</div>
							{:else if kind === 'roblox.group.membership'}
								<GroupSelect source="roblox" value={item.group_id?.toString()} onChange={i => item.group_id = parseInt(i)}/>
							{:else if kind === 'roblox.group.membership.role'}
								{@const group_id = item.group_id}
								{@const roles = group_id ? $roblox_group_roles[group_id] : null}
								<div class="fields">
									<GroupSelect source="roblox" value={group_id?.toString()} onChange={i => item.group_id = parseInt(i)}/>
									{#if roles}
										<Select.Root bind:value={item.role_id} placeholder={$t('label.select_item')}>
											<p>{$t('mellow_sync_action.criteria.item.roblox.group.roles')}</p>
											{#each roles.filter(item => !!item.rank) as role}
												<Select.Item value={role.id}>
													{role.displayName}
												</Select.Item>
											{/each}
										</Select.Root>
									{:else if group_id}
										<Loader/>
									{/if}
								</div>
							{:else if kind === 'roblox.group.membership.role.rank.in_range'}
								<div class="fields">
									<GroupSelect source="roblox" value={item.group_id?.toString()} onChange={i => item.group_id = parseInt(i)}/>
									<NumberInput min={0} max={255} bind:value={item.range_lower} placeholder="min"/>
									<NumberInput min={0} max={255} bind:value={item.range_upper} placeholder="max"/>
								</div>
							{:else if kind === 'patreon.campaign.tier_subscription'}
								<div class="fields">
									<NumberInput no_controls placeholder={$t('mellow_sync_action.criteria.item.patreon.campaign.id')} bind:value={item.campaign_id}/>
									<NumberInput no_controls placeholder={$t('mellow_sync_action.criteria.item.patreon.campaign.tier.id')} bind:value={item.tier_id}/>
								</div>
							{/if}
						</div>
						<div class="buttons">
							<button type="button" title={$t('action.duplicate')} on:click={() => sync_action.criteria.items = [...sync_action.criteria.items, clone_json(item)]}>
								<Clipboard/>
							</button>
							<button type="button" title={$t('action.delete')} on:click={() => sync_action.criteria.items = sync_action.criteria.items.filter(i => i !== item)}>
								<X/>
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</WithSideNavigation>

<ContextMenu.Root bind:trigger={create_criteria_item_trigger}>
	<p>{$t('mellow_sync_action_editor.criteria.platforms')}</p>
	{#each UI_CRITERIA_ITEM_LIST as { items, connection_kind }}
		{#if connection_kind}
			<ContextMenu.Sub>
				<svelte:fragment slot="trigger">
					<svelte:component this={USER_CONNECTION_METADATA[connection_kind]?.icon}/>{$t(`user_connection.type.${connection_kind}`)}
				</svelte:fragment>
				<p>{$t(`user_connection.type.${connection_kind}`)} {$t('mellow_sync_action_editor.criteria.platforms.label')}</p>
				{#each items as item}
					{#if item === 'separator'}
						<div class="separator"/>
					{:else}
						<button type="button" on:click={() => add_criteria_item(item.kind)}>
							<svelte:component this={item.icon}/>
							{$t(`mellow_sync_action.criteria.item.kind.${item.kind}`)}
						</button>
					{/if}
				{/each}
			</ContextMenu.Sub>
		{:else}
			<p>{$t('mellow_sync_action_editor.criteria.other')}</p>
			{#each items as item}
				{#if item === 'separator'}
					<div class="separator"/>
				{:else}
					<button type="button" on:click={() => add_criteria_item(item.kind)}>
						<svelte:component this={item.icon}/>
						{$t(`mellow_sync_action.criteria.item.kind.${item.kind}`)}
					</button>
				{/if}
			{/each}
		{/if}
	{/each}
</ContextMenu.Root>

<style lang="scss">
	.role_icon {
		object-fit: contain;
	}
	.pre_auto_import_request, .auto_import_request {
		display: flex;
	}
	.footer {
		min-width: 512px;
	}
	.auto_import_request {
		height: fit-content;
		overflow: hidden auto;
		max-height: 384px;
		flex-direction: column;
		.header {
			display: flex;
			h2 {
				margin: 0;
				font-size: .9em;
				font-weight: 450;
			}
			p {
				color: var(--color-secondary);
				margin: 0 0 16px;
				font-size: .7em;
			}
		}
		.items {
			background: var(--background-primary);
			box-shadow: 0 0 0 1px var(--border-primary);
			border-radius: 8px;
		}
	}
	.mellow-action {
		gap: 32px;
		width: -webkit-fill-available;
		display: flex;
		max-width: -webkit-fill-available;
		.left, .right {
			width: 50%;
			max-width: 50%;
		}
		.fields {
			gap: 16px;
			width: 100%;
			display: flex;
			.field {
				width: 100%;
				margin: 16px 0 0;
				p {
					margin-top: 0;
				}
			}
		}
		.criteria_items {
			gap: 8px;
			width: -webkit-fill-available;
			margin: 16px 0 0;
			display: flex;
			margin-bottom: 16px;
			flex-direction: column;
			.item {
				width: inherit;
				display: flex;
				padding: 16px;
				position: relative;
				box-shadow: inset 0 0 0 1px var(--border-primary);
				background: center / 200px repeat var(--grain), #00000040;
				border-radius: 20px;
				
				//-webkit-backdrop-filter: blur(16px);
				//backdrop-filter: blur(16px);
				.title {
					gap: 16px;
					margin: 0 0 0 4px;
					display: flex;
					font-size: .9em;
					font-weight: 500;
					white-space: nowrap;
					align-items: center;
				}
				.rfields {
					gap: 16px;
					display: flex;
					flex-direction: column;
				}
				.buttons {
					top: 16px;
					gap: 16px;
					right: 16px;
					display: flex;
					position: absolute;
					button {
						color: var(--color-secondary);
						border: none;
						cursor: pointer;
						height: fit-content;
						padding: 0;
						display: flex;
						background: none;
						transition: color .5s;
						&:hover {
							color: var(--color-primary);
						}
					}
				}
				&.highlighted {
					animation: 1s 5 alternate basic-focus;
				}
			}
		}
		.radio-field {
			margin: 8px 0;
			display: flex;
			align-items: center;
			p {
				margin: 0;
				font-size: .9em;
				margin-left: 16px;
			}
		}
		:global(.text-input), :global(.select-trigger) {
			width: -webkit-fill-available;
			min-width: unset !important;
			max-width: 100%;
		}
		:global(.button) {
			min-width: max-content;
		}
		:global(.container:has(.button)) {
			min-width: max-content;
		}
		.input-label:first-child {
			margin-top: 0;
		}
		.divider {
			width: 100%;
			height: 1px;
			margin: 24px 0 8px;
			background: var(--border-primary);
		}
	}
</style>