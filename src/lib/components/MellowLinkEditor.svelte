<script lang="ts">
	import { onMount } from 'svelte';
	import type { GroupRole } from '@hakumi/roblox-api';
	import { Button, Select, TextInput, NumberInput, DropdownMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { copyJson } from '../util';
	import type { RequestError, MellowProfileAction } from '../types';
	import { createMellowServerProfileSyncAction, updateMellowServerProfileSyncAction } from '../api';
	import { MAPPED_MELLOW_SYNC_ACTION_ICONS, MAPPED_MELLOW_SYNC_REQUIREMENTS, MELLOW_PROFILE_ACTION_DEFAULT_METADATA } from '../constants';
	import { MellowProfileSyncActionType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '../enums';

	import Radio from './Radio.svelte';
	import Loader from './Loader.svelte';
	import GroupSelect from './GroupSelect.svelte';
	import RequestErrorUI from './RequestError.svelte';

	import X from '../icons/X.svelte';
	import Plus from '../icons/Plus.svelte';
	import Check from '../icons/Check.svelte';
	import GridFill from '../icons/GridFill.svelte';
	import Clipboard from '../icons/Clipboard.svelte';
	import UIChecksGrid from '../icons/UIChecksGrid.svelte';
	export let data: { items: MellowProfileAction[] };
	export let target: MellowProfileAction | null = null;
	export let onSave: () => void;
	export let serverId: string;
	export let onCancel: () => void;
	export let discordRoles: { id: string, name: string }[];

	let requirementTrigger: () => void;

	let name = target?.name ?? '';
	let type = target?.type ?? MellowProfileSyncActionType.GiveRoles;
	let metadata = { ...copyJson(MELLOW_PROFILE_ACTION_DEFAULT_METADATA[type]), ...(target ? copyJson(target.metadata) : {}) };
	let requirements: [MellowProfileSyncActionRequirementType, string[]][] = target?.requirements.map(item => [item.type, [...item.data]]) ?? [];
	let requirementsType = target?.requirements_type ?? MellowProfileSyncActionRequirementsType.MeetAll;

	let saving = false;
	let editing = !!target;
	let saveError: RequestError | null = null;

	let groupRoles: Record<string, GroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId])
		getGroupRoles(roleSearchId.toString());

	let itemRefs: HTMLDivElement[] = [];
	let lastItemRefLength = 0;
	$: {
		const length = itemRefs.filter(item => item).length;
		if (length > lastItemRefLength)
			itemRefs.findLast(item => item)?.scrollIntoView({ block: 'nearest' });
		lastItemRefLength = length;
	}

	const save = async () => {
		saving = !(saveError = null);
		if (target) {
			const newName = name || 'Unnamed Action';
			const newRequirements = requirements.map(item => ({
				type: item[0],
				data: item[1]
			}));
			const response = await updateMellowServerProfileSyncAction(serverId, target.id, {
				type: type === target.type ? undefined : type,
				name: newName === target.name ? undefined : newName,
				metadata: JSON.stringify(metadata) === JSON.stringify(target.metadata) ? undefined : metadata,
				requirements: JSON.stringify(newRequirements) === JSON.stringify(target.requirements.map(item => ({ type: item.type, data: item.data }))) ? undefined : newRequirements,
				requirements_type: requirementsType === target.requirements_type ? undefined : requirementsType
			});
			if (response.success) {
				data.items = data.items.map(item => item.id === target!.id ? response.data as any : item);
				saving = false;
				resetAdd();
				onCancel();
			} else
				return saving = !(saveError = response);
		} else {
			const response = await createMellowServerProfileSyncAction(serverId, {
				type,
				name: name || 'Unnamed Action',
				metadata,
				requirements: requirements.map(item => ({
					type: item[0],
					data: item[1]
				})),
				requirements_type: requirementsType
			});
			if (response.success) {
				data.items = [...data.items, response.data as any];
				saving = false;
				resetAdd();
				onCancel();
				setTimeout(onSave, 100);
			} else
				return saving = !(saveError = response);
		}
		target = null;
		editing = false;
	};
	const addRequirement = (type: any) => requirements = [...requirements, [type, []]];
	const resetAdd = () => {
		metadata = {}, name = '', requirements = [];
		type = MellowProfileSyncActionType.GiveRoles, requirementsType = MellowProfileSyncActionRequirementsType.MeetAll;
		target = null;
		editing = false;
	};
	const getGroupRoles = (id: string) => fetch(`/api/roblox/group-roles?id=${id}`)
		.then(response => response.json() as Promise<GroupRole[]>)
		.then(data => groupRoles[id] = data.filter(role => role.rank).sort((a, b) => b.rank - a.rank));

	onMount(() => {
		let requesting: string[] = [];
		for (const [type, data] of requirements)
			if ((type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRole || type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange || type === MellowProfileSyncActionRequirementType.RobloxInGroup) && !requesting.includes(data[0]))
				requesting.push(data[0]), getGroupRoles(data[0]);
	});
</script>

<div class="mellow-sync-action-editor">
	<h1>{$t(`mellow_link_editor.header.${!!target}`)}</h1>

	<div class="field">
		<p class="modal-label">{$t('mellow_link_editor.name')}</p>
		<TextInput bind:value={name} placeholder="Unnamed Action"/>
	</div>

	<p class="modal-label">{$t('mellow_link_editor.requirements')}</p>
	<div class="fields">
		<Select.Root placeholder="" bind:value={requirementsType}>
			{#each Object.values(MellowProfileSyncActionRequirementsType) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{#if item}
							<UIChecksGrid/>
						{:else}
							<GridFill/>
						{/if}
						{$t(`mellow_sync_action.requirements_type.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>
		<DropdownMenu.Root bind:trigger={requirementTrigger}>
			<Button slot="trigger" on:click={requirementTrigger}>
				<Plus/>{$t('action.create_new')}
			</Button>
			<p>{$t('mellow_link_editor.requirements.platforms')}</p>
			{#each MAPPED_MELLOW_SYNC_REQUIREMENTS.entries() as [id, [items, icon]]}
				{#if id === MAPPED_MELLOW_SYNC_REQUIREMENTS.length - 1}
					<p>{$t('mellow_link_editor.requirements.other')}</p>
					<!-- is there any way to re-use the same code below? -->
					{#each items as item}
						{#if item === 'separator'}
							<div class="separator"/>
						{:else}
							<button type="button" on:click={() => addRequirement(item[0])}>
								<svelte:component this={item[1]}/>
								{$t(`mellow_sync_action.requirement.${item[0]}`)}
							</button>
						{/if}
					{/each}
				{:else}
					<DropdownMenu.Sub>
						<svelte:fragment slot="trigger">
							<svelte:component this={icon}/>{$t(`mellow_link_editor.requirements.platforms.${id}`)}
						</svelte:fragment>
						<p>{$t(`mellow_link_editor.requirements.platforms.${id}`)} {$t('label.requirements')}</p>
						{#each items as item}
							{#if item === 'separator'}
								<div class="separator"/>
							{:else}
								<button type="button" on:click={() => addRequirement(item[0])}>
									<svelte:component this={item[1]}/>
									{$t(`mellow_sync_action.requirement.${item[0]}`)}
								</button>
							{/if}
						{/each}
					</DropdownMenu.Sub>
				{/if}
			{/each}
		</DropdownMenu.Root>
	</div>
	<div class="requirements">
		{#each requirements as item, index}
			<div class="item" class:highlighted={index === requirements.length - 1} bind:this={itemRefs[index]}>
				<div class="rfields">
					<p class="title">
						<svelte:component this={MAPPED_MELLOW_SYNC_REQUIREMENTS.find(i => i[0].some(j => j[0] === item[0]))?.[1]}/>
						{$t(`mellow_sync_action.requirement.${item[0]}`)}
					</p>
					{#if item[0] === MellowProfileSyncActionRequirementType.RobloxHaveGroupRole}
						<div class="fields">
							<GroupSelect source="roblox" bind:value={item[1][0]} onChange={value => roleSearchId = value}/>
							{#if groupRoles[item[1][0]]}
								<Select.Root bind:value={item[1][1]} placeholder={$t('mellow_link_editor.requirement.group_role.placeholder')}>
									<p>{$t('mellow_sync_action.requirement.1.select')}</p>
									{#each groupRoles[item[1][0]] as role}
										<Select.Item value={role.id.toString()}>
											{role.name}
										</Select.Item>
									{/each}
								</Select.Root>
							{:else if item[1][0]}
								<Loader/>
							{/if}
						</div>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange}
						<div class="fields">
							<GroupSelect source="roblox" bind:value={item[1][0]}/>
							<NumberInput min={0} max={255} bind:string={item[1][1]}/>
							<NumberInput min={0} max={255} bind:string={item[1][2]}/>
						</div>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxInGroup}
						<GroupSelect source="roblox" bind:value={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.MeetOtherAction}
						<Select.Root bind:value={item[1][0]} placeholder={$t('mellow_link_editor.requirement.link.placeholder')}>
							{#each data.items.filter(action => action.id !== target?.id && !requirements.some(r => r !== item && r[0] === MellowProfileSyncActionRequirementType.MeetOtherAction && r[1][0] === action.id)) as action}
								<Select.Item value={action.id}>
									{action.name}
								</Select.Item>
							{/each}
						</Select.Root>
					{:else if item[0] === MellowProfileSyncActionRequirementType.HAKUMIInTeam}
						<GroupSelect source="self" bind:value={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHaveAsset}
						<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.8.id')} bind:string={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHaveBadge}
						<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.9.id')} bind:string={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHavePass}
						<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.10.id')} bind:string={item[1][0]}/>
					{/if}
				</div>
				<div class="buttons">
					<button type="button" title={$t('action.duplicate')} on:click={() => requirements = [...requirements, JSON.parse(JSON.stringify(item))]}>
						<Clipboard/>
					</button>
					<button type="button" title={$t('action.delete')} on:click={() => requirements = requirements.filter(i => i !== item)}>
						<X/>
					</button>
				</div>
			</div>
		{/each}
	</div>

	<div class="fields">
		<div class="field">
			<p class="modal-label">{$t('mellow_link_editor.type')}</p>
			<Select.Root placeholder="" bind:value={type}>
				<p>{$t('mellow_link_editor.type.category')}</p>
				{#each Object.values(MellowProfileSyncActionType) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							<svelte:component this={MAPPED_MELLOW_SYNC_ACTION_ICONS[item]}/>
							{$t(`mellow_sync_action.type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
			{#if type === MellowProfileSyncActionType.GiveRoles}
				<div class="radio-field">
					<Radio bind:value={metadata.can_remove}/>
					<p>{$t('mellow_sync_action.type.0.can_remove')}</p>
				</div>
			{/if}
		</div>
	
		{#if type === MellowProfileSyncActionType.GiveRoles}
			<div class="field roles">
				<p class="modal-label">{$t('mellow_link_editor.discord_roles')}</p>
				<Select.Root withSearch bind:values={metadata.items} placeholder={$t('mellow_link_editor.discord_roles.placeholder')}>
					<p>{$t('mellow_link_editor.discord_roles.category')}</p>
					{#each discordRoles as item}
						<Select.Item value={item.id}>
							{item.name}
						</Select.Item>
					{/each}
				</Select.Root>
			</div>
		{:else if type === MellowProfileSyncActionType.BanFromServer || type === MellowProfileSyncActionType.KickFromServer}
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.audit_reason')}</p>
				<TextInput bind:value={metadata.audit_log_reason} placeholder={$t('label.reason')}/>
			</div>
		{:else if type === MellowProfileSyncActionType.CancelSync}
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.user_reason')}</p>
				<TextInput bind:value={metadata.user_facing_reason} placeholder={$t('label.reason')}/>
			</div>
		{/if}
	</div>
	{#if type === MellowProfileSyncActionType.BanFromServer || type === MellowProfileSyncActionType.KickFromServer}
		<div class="fields">
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.user_reason')}</p>
				<TextInput bind:value={metadata.user_facing_reason} placeholder={$t('label.reason')}/>
			</div>
		</div>
	{/if}

	<RequestErrorUI data={saveError}/>
	<p class="explanation">{$t(`mellow_sync_action.explanation.${type}`, [metadata])} {$t(`mellow_sync_action.explanation.end.${requirementsType}`, [requirements.length])}</p>
	<div class="modal-buttons">
		<Button on:click={save} disabled={saving}>
			<Check/>{$t(target ? 'action.save_changes' : 'mellow_link_editor.finish')}
		</Button>
		<Button colour="secondary" on:click={() => (onCancel(), resetAdd())} disabled={saving}>
			<X/>{$t('action.cancel')}
		</Button>
	</div>
</div>

<style lang="scss">
	.mellow-sync-action-editor {
		height: 100%;
		display: flex;
		overflow: auto;
		flex-direction: column;
		h1 {
			margin-bottom: 32px;
		}
		.requirements {
			gap: 8px;
			margin: 8px 0 0;
			display: flex;
			flex-wrap: wrap;
			margin-bottom: 16px;
			.item {
				flex: 1 1 384px;
				width: 0;
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

		.fields {
			gap: 16px;
			display: flex;
			.field {
				margin: 16px 0 0;
				p {
					margin-top: 0;
				}
				&.roles > :global(.select-trigger) {
					width: 512px;
				}
			}
		}
		.radio-field {
			margin: 8px 16px;
			display: flex;
			align-items: center;
			p {
				margin: 0;
				font-size: .9em;
				margin-left: 16px;
			}
		}
		.audit-reason, .audit-reason :global(.text-input) {
			width: 100%;
		}

		.modal-label {
			color: var(--color-secondary);
			margin: 0 0 6px;
			font-size: .9em;
			&:not(:first-child):not(:nth-child(2)) {
				margin-top: 24px;
			}
		}
		.explanation {
			color: var(--color-secondary);
			margin: auto 0 12px;
			font-size: .9em;
		}
		.modal-buttons {
			gap: 16px;
			display: flex;
		}
	}
</style>