<script lang="ts">
	import { Button, Select, TextInput, NumberInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import type { PageData } from '../../routes/mellow/server/[id]/settings/syncing/actions/$types';
	import type { RequestError, RobloxGroupRole } from '../types';
	import { MAPPED_MELLOW_SYNC_ACTION_ICONS, MAPPED_MELLOW_SYNC_REQUIREMENTS } from '$lib/constants';
	import { createMellowServerProfileSyncAction, updateMellowServerProfileSyncAction } from '$lib/api';
	import { MellowProfileSyncActionType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '../enums';

	import Loader from './Loader.svelte';
	import GroupSelect from './GroupSelect.svelte';
	import RequestErrorUI from './RequestError.svelte';

	import X from '../icons/X.svelte';
	import Plus from '../icons/Plus.svelte';
	import Check from '../icons/Check.svelte';
	import GridFill from '../icons/GridFill.svelte';
	import Clipboard from '../icons/Clipboard.svelte';
	import UIChecksGrid from '../icons/UIChecksGrid.svelte';
	export let data: PageData;
	export let target: PageData['binds'][number] | null = null;
	export let onSave: () => void;
	export let serverId: string;
	export let onCancel: () => void;

	let roleTrigger: () => void;
	let requirementTrigger: () => void;

	let name = '';
	let type = MellowProfileSyncActionType.DiscordRoles;
	let actionData: string[] = [];
	let requirements: [MellowProfileSyncActionRequirementType, string[]][] = [];
	let requirementsType = MellowProfileSyncActionRequirementsType.MeetAll;

	let saving = false;
	let editing = false;
	let saveError: RequestError | null = null;

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId])
		getGroupRoles(roleSearchId.toString());

	$: if (target && !editing) {
		name = target.name, type = target.type, actionData = [...target.data];
		requirements = target.requirements.map(item => [item.type, item.data]), requirementsType = target.requirements_type;
		editing = true;
		for (const [type, data] of requirements)
			if (type === MellowProfileSyncActionRequirementType.RobloxHasGroupRole || type === MellowProfileSyncActionRequirementType.RobloxHasGroupRankInRange || type === MellowProfileSyncActionRequirementType.RobloxInGroup)
				getGroupRoles(data[0]);
	}

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
				data: JSON.stringify(actionData) === JSON.stringify(target.data) ? undefined : actionData,
				requirements: JSON.stringify(newRequirements) === JSON.stringify(target.requirements.map(item => ({ type: item.type, data: item.data }))) ? undefined : newRequirements,
				requirements_type: requirementsType === target.requirements_type ? undefined : requirementsType
			});
			if (response.success) {
				data.binds = data.binds.map(item => item.id === target!.id ? response.data as any : item);
				saving = false;
				resetAdd();
				onCancel();
			} else
				return saving = !(saveError = response);
		} else {
			const response = await createMellowServerProfileSyncAction(serverId, {
				type,
				data: actionData,
				name: name || 'Unnamed Action',
				requirements: requirements.map(item => ({
					type: item[0],
					data: item[1]
				})),
				requirements_type: requirementsType
			});
			if (response.success) {
				data.binds = [...data.binds, response.data as any];
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
		actionData = [], name = '', requirements = [];
		type = MellowProfileSyncActionType.DiscordRoles, requirementsType = MellowProfileSyncActionRequirementsType.MeetAll;
		target = null;
		editing = false;
	};
	const getGroupRoles = (id: string) => fetch(`/api/roblox/group-roles?id=${id}`)
		.then(response => response.json() as Promise<RobloxGroupRole[]>)
		.then(data => groupRoles[id] = data.filter(role => role.rank).sort((a, b) => b.rank - a.rank));
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
						{$t(`mellow_bind.requirements_type.${item}`)}
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
								{$t(`mellow_bind.requirement.${item[0]}`)}
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
									{$t(`mellow_bind.requirement.${item[0]}`)}
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
						{$t(`mellow_bind.requirement.${item[0]}`)}
					</p>
					{#if item[0] === MellowProfileSyncActionRequirementType.RobloxHasGroupRole}
						<div class="fields">
							<GroupSelect source="roblox" bind:value={item[1][0]} onChange={value => roleSearchId = value}/>
							{#if groupRoles[item[1][0]]}
								<Select.Root bind:value={item[1][1]} placeholder={$t('mellow_link_editor.requirement.group_role.placeholder')}>
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
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHasGroupRankInRange}
						<div class="fields">
							<GroupSelect source="roblox" bind:value={item[1][0]}/>
							<NumberInput min={0} max={255} bind:value={item[1][1]}/>
							<NumberInput min={0} max={255} bind:value={item[1][2]}/>
						</div>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxInGroup}
						<GroupSelect source="roblox" bind:value={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.MeetOtherAction}
						<Select.Root bind:value={item[1][0]} placeholder={$t('mellow_link_editor.requirement.link.placeholder')}>
							{#each data.binds.filter(bind => bind.id !== target?.id && !requirements.some(r => r !== item && r[0] === MellowProfileSyncActionRequirementType.MeetOtherAction && r[1][0] === bind.id)) as bind}
								<Select.Item value={bind.id}>
									{bind.name}
								</Select.Item>
							{/each}
						</Select.Root>
					{:else if item[0] === MellowProfileSyncActionRequirementType.VoxelifiedInTeam}
						<GroupSelect source="self" bind:value={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHasAsset}
						<NumberInput min={0} placeholder={$t('mellow_bind.requirement.8.id')} bind:value={item[1][0]}/>
					{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHasBadge}
						<NumberInput min={0} placeholder={$t('mellow_bind.requirement.9.id')} bind:value={item[1][0]}/>
						{:else if item[0] === MellowProfileSyncActionRequirementType.RobloxHasPass}
						<NumberInput min={0} placeholder={$t('mellow_bind.requirement.10.id')} bind:value={item[1][0]}/>
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
							{$t(`mellow_bind.type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
	
		{#if type === MellowProfileSyncActionType.DiscordRoles}
			<div class="field">
				<p class="modal-label">{$t('mellow_link_editor.discord_roles')}</p>
				<div class="roles">
					{#each actionData as item}
						<button class="item focusable" type="button" title={$t('action.remove')} on:click={() => actionData = actionData.filter(i => i !== item)}>
							{data?.roles.find(role => role.id === item)?.name}
						</button>
					{/each}
					<DropdownMenu.Root bind:trigger={roleTrigger}>
						<Button slot="trigger" circle on:click={roleTrigger}>
							<Plus/>
						</Button>
						<p>{$t('mellow_link_editor.discord_roles.category')}</p>
						{#each data?.roles.filter(role => !actionData.includes(role.id)) as item}
							<button type="button" on:click={() => actionData = [...actionData, item.id]}>
								{item.name}
							</button>
						{/each}
						
						<br/>
						<p>{$t('mellow_link_editor.discord_roles.options')}</p>
						<button type="button" on:click={() => actionData = data.roles.map(role => role.id)}>
							{$t('mellow_link_editor.discord_roles.add_all')}
						</button>
					</DropdownMenu.Root>
				</div>
			</div>
		{:else if type === MellowProfileSyncActionType.BanDiscord || type === MellowProfileSyncActionType.KickDiscord}
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.audit_reason')}</p>
				<TextInput bind:value={actionData[0]} placeholder={$t('label.reason')}/>
			</div>
		{:else if type === MellowProfileSyncActionType.CancelSync}
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.user_reason')}</p>
				<TextInput bind:value={actionData[0]} placeholder={$t('label.reason')}/>
			</div>
		{/if}
	</div>
	{#if type === MellowProfileSyncActionType.BanDiscord || type === MellowProfileSyncActionType.KickDiscord}
		<div class="fields">
			<div class="field audit-reason">
				<p class="modal-label">{$t('label.user_reason')}</p>
				<TextInput bind:value={actionData[1]} placeholder={$t('label.reason')}/>
			</div>
		</div>
	{/if}

	<RequestErrorUI data={saveError}/>
	<p class="explanation">{$t(`mellow_bind.explanation.${type}`, [actionData.length])} {$t(`mellow_bind.explanation.end.${requirementsType}`, [requirements.length])}</p>
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
				
				-webkit-backdrop-filter: blur(16px);
				backdrop-filter: blur(16px);
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
			}
		}
		.audit-reason, .audit-reason :global(.text-input) {
			width: 100%;
		}

		.roles {
			gap: 8px 16px;
			flex: 0 1 auto;
			display: flex;
			flex-wrap: wrap;
			max-width: 512px;
			.item {
				color: #fff;
				height: 40px;
				border: none;
				cursor: pointer;
				display: flex;
				padding: 0 24px;
				font-size: 14px;
				background: none;
				transition: background .5s, box-shadow .5s;
				box-shadow: inset 0 0 0 1px #fff;
				font-weight: 500;
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 20px;
				&:hover {
					background: #ffffff0d;
					box-shadow: inset 0 0 0 1px #ffffff80;
				}
			}
			:global(.menu-content) {
				overflow: auto;
				max-height: 256px;
			}
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