<script lang="ts">
	import { onMount } from 'svelte';
	import type { GroupRole } from '@hakumi/roblox-api';
	import { Button, Select, TextInput, NumberInput, ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { copyJson, payloadDiff } from '$lib/util';
	import { editor, setEditorCallback } from '$lib/store';
	import { createMellowServerProfileSyncAction, updateMellowServerProfileSyncAction } from '$lib/api';
	import { MAPPED_MELLOW_SYNC_ACTION_ICONS, MAPPED_MELLOW_SYNC_REQUIREMENTS, MELLOW_PROFILE_ACTION_DEFAULT_METADATA } from '$lib/constants';
	import { MellowProfileSyncActionType, MellowProfileSyncActionRequirementType, MellowProfileSyncActionRequirementsType } from '$lib/enums';

	import Radio from '$lib/components/Radio.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import WithSideNavigation from '$lib/layouts/WithSideNavigation.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Link from 'virtual:icons/bi/link';
	import Plus from 'virtual:icons/bi/plus-lg';
	import GridFill from 'virtual:icons/bi/grid-fill';
	import Clipboard from 'virtual:icons/bi/clipboard';
	import UIChecksGrid from 'virtual:icons/bi/ui-checks-grid';
	export let data;

	$: action = data.items.find(item => item.id === $page.params.action_id);

	const cloneId = $page.url.searchParams.get('clone_from_id');
	const toClone = cloneId ? data.items.find(item => item.id === cloneId) : undefined;

	let name = '';
	let type = MellowProfileSyncActionType.GiveRoles;
	let metadata: any = {};
	let requirements: Omit<NonNullable<typeof action>['requirements'][number], 'id'>[] = [];
	let requirements_type = MellowProfileSyncActionRequirementsType.MeetAll;
	const reset = () => (name = action!.name, type = action!.type, metadata = copyJson(action!.metadata), requirements = action!.requirements.map(i => ({ data: i.data, type: i.type })), requirements_type = action!.requirements_type);
	const reset2 = () => (
		name = toClone?.name ?? '',
		type = toClone?.type ?? MellowProfileSyncActionType.GiveRoles,
		metadata = { ...copyJson(MELLOW_PROFILE_ACTION_DEFAULT_METADATA[type]), ...(toClone ? copyJson(toClone.metadata) : action ? copyJson(action.metadata) : {}) },
		requirements = toClone?.requirements ?? [],
		requirements_type = toClone?.requirements_type ?? MellowProfileSyncActionRequirementsType.MeetAll
	);
	$: if (action)
		reset();
	else
		reset2();

	let lastType: MellowProfileSyncActionType = type;
	$: if (type !== lastType)
		(metadata = copyJson(MELLOW_PROFILE_ACTION_DEFAULT_METADATA[type]), lastType = type);

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

	const addRequirement = (type: any) => requirements = [...requirements, {
		type,
		data: []
	}];
	const getGroupRoles = (id: string) => fetch(`/api/roblox/group-roles?id=${id}`)
		.then(response => response.json() as Promise<GroupRole[]>)
		.then(data => groupRoles[id] = data.filter(role => role.rank).sort((a, b) => b.rank - a.rank));

	let requirementTrigger: () => void;
	onMount(() => {
		let requesting: string[] = [];
		for (const { type, data } of requirements)
			if ((type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRole || type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange || type === MellowProfileSyncActionRequirementType.RobloxInGroup) && !requesting.includes(data[0]))
				requesting.push(data[0]), getGroupRoles(data[0]);
	});

	$: roles = [...data.roles, ...(type === MellowProfileSyncActionType.GiveRoles ? (metadata.items as string[]).filter(i => !data.roles.some(k => k.id === i)).map(i => ({ id: i, name: 'Unknown Role' })) : [])];

	$: editor.canSave.set(!action || name !== action.name || type !== action.type || JSON.stringify(metadata) !== JSON.stringify(action.metadata) || JSON.stringify(requirements) !== JSON.stringify(action.requirements.map(i => ({ data: i.data, type: i.type }))) || requirements_type !== action.requirements_type);
	setEditorCallback(async () => {
		const payload = {
			name,
			type,
			metadata,
			requirements,
			requirements_type
		};
		const response = action ? await updateMellowServerProfileSyncAction($page.params.id, action.id, payloadDiff({
			...action,
			requirements: action.requirements.map(i => [i.type, i.data])
		}, payload))
			: await createMellowServerProfileSyncAction($page.params.id, payload);
		if (response.success) {
			if (action)
				data.items = data.items.map(i => i.id === action!.id ? response.data : i);
			else {
				data.items = [...data.items, response.data];
				await goto(`/mellow/server/${$page.params.id}/syncing/actions/${response.data.id}`);
			}
		}
	});

	$: navItems = [
		[`/mellow/server/${$page.params.id}/syncing/actions/create`, Plus, $t('action.create_new')],
		'space',
		...data.items.map(item => [`/mellow/server/${$page.params.id}/syncing/actions/${item.id}`, Link, item.name])
	] as any[];
</script>

<WithSideNavigation items={navItems}>
	<div class="mellow-action">
		<div class="left">
			<p class="input-label">{$t('profile.name')}</p>
			<TextInput bind:value={name} placeholder={$t('label.required')}/>

			<div class="divider"/>

			<div class="fields">
				<div class="field">
					<p class="input-label">{$t('mellow_link_editor.type')}</p>
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
				</div>
			</div>

			<div class="divider"/>

			{#if type === MellowProfileSyncActionType.GiveRoles}
				<div class="fields">
					<div class="field roles">
						<p class="input-label">{$t('mellow_link_editor.discord_roles')}</p>
						<Select.Root withSearch bind:values={metadata.items} placeholder={$t('mellow_link_editor.discord_roles.placeholder')}>
							<p>{$t('mellow_link_editor.discord_roles.category')}</p>
							{#each roles as item}
								<Select.Item value={item.id}>
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
							<Radio bind:value={metadata.can_remove}/>
							<p>{$t('mellow_sync_action.type.0.can_remove')}</p>
						</div>
					</div>
				</div>
			{:else if type === MellowProfileSyncActionType.BanFromServer || type === MellowProfileSyncActionType.KickFromServer}
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.audit_reason')}</p>
						<TextInput bind:value={metadata.audit_log_reason} placeholder={$t('label.optional')}/>
					</div>
				</div>
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.user_reason')}</p>
						<TextInput bind:value={metadata.user_facing_reason} placeholder={$t('label.optional')}/>
					</div>
				</div>
			{:else if type === MellowProfileSyncActionType.CancelSync}
				<div class="fields">
					<div class="field">
						<p class="input-label">{$t('label.user_reason')}</p>
						<TextInput bind:value={metadata.user_facing_reason} placeholder={$t('label.optional')}/>
					</div>
				</div>
			{/if}
		</div>
		<div class="right">
			<p class="input-label">{$t('mellow_link_editor.requirements')}</p>
			<div class="fields">
				<Select.Root placeholder="" bind:value={requirements_type}>
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
				<Button on:click={requirementTrigger}>
					<Plus/>{$t('action.create_new')}
				</Button>
			</div>

			<div class="requirements">
				{#each requirements as item, index}
					<div class="item" class:highlighted={index === requirements.length - 1} bind:this={itemRefs[index]}>
						<div class="rfields">
							<p class="title">
								<svelte:component this={MAPPED_MELLOW_SYNC_REQUIREMENTS.find(i => i[0].some(j => j[0] === item.type))?.[1]}/>
								{$t(`mellow_sync_action.requirement.${item.type}`)}
							</p>
							{#if item.type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRole}
								<div class="fields">
									<GroupSelect source="roblox" bind:value={item.data[0]} onChange={value => roleSearchId = value}/>
									{#if groupRoles[item.data[0]]}
										<Select.Root bind:value={item.data[1]} placeholder={$t('mellow_link_editor.requirement.group_role.placeholder')}>
											<p>{$t('mellow_sync_action.requirement.1.select')}</p>
											{#each groupRoles[item.data[0]] as role}
												<Select.Item value={role.id.toString()}>
													{role.name}
												</Select.Item>
											{/each}
										</Select.Root>
									{:else if item.data[0]}
										<Loader/>
									{/if}
								</div>
							{:else if item.type === MellowProfileSyncActionRequirementType.RobloxHaveGroupRankInRange}
								<div class="fields">
									<GroupSelect source="roblox" bind:value={item.data[0]}/>
									<NumberInput min={0} max={255} bind:string={item.data[1]}/>
									<NumberInput min={0} max={255} bind:string={item.data[2]}/>
								</div>
							{:else if item.type === MellowProfileSyncActionRequirementType.RobloxInGroup}
								<GroupSelect source="roblox" bind:value={item.data[0]}/>
							{:else if item.type === MellowProfileSyncActionRequirementType.MeetOtherAction}
								<Select.Root bind:value={item.data[0]} placeholder={$t('mellow_link_editor.requirement.link.placeholder')}>
									{#each data.items.filter(a => a.id !== action?.id && !requirements.some(r => r !== item && r.type === MellowProfileSyncActionRequirementType.MeetOtherAction && r.data[0] === action.id)) as action}
										<Select.Item value={action.id}>
											{action.name}
										</Select.Item>
									{/each}
								</Select.Root>
							{:else if item.type === MellowProfileSyncActionRequirementType.HAKUMIInTeam}
								<GroupSelect source="self" bind:value={item.data[0]}/>
							{:else if item.type === MellowProfileSyncActionRequirementType.RobloxHaveAsset}
								<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.8.id')} bind:string={item.data[0]}/>
							{:else if item.type === MellowProfileSyncActionRequirementType.RobloxHaveBadge}
								<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.9.id')} bind:string={item.data[0]}/>
							{:else if item.type === MellowProfileSyncActionRequirementType.RobloxHavePass}
								<NumberInput min={0} placeholder={$t('mellow_sync_action.requirement.10.id')} bind:string={item.data[0]}/>
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
		</div>
	</div>
</WithSideNavigation>

<ContextMenu.Root bind:trigger={requirementTrigger}>
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
			<ContextMenu.Sub>
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
			</ContextMenu.Sub>
		{/if}
	{/each}
</ContextMenu.Root>

<style lang="scss">
	.mellow-action {
		gap: 32px;
		display: flex;
		.left, .right {
			flex: 1 1 auto;
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
		.requirements {
			gap: 8px;
			margin: 16px 0 0;
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