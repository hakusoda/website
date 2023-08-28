<script lang="ts">
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from '../../routes/mellow/server/[id]/settings/roblox/binds/$types';
	import { createMellowServerRobloxLink } from '$lib/api';
	import type { RequestError, RobloxGroupRole } from '../types';
	import { MellowBindType, RequestErrorType, MellowBindRequirementType, MellowBindRequirementsType } from '../enums';

	import Modal from './Modal.svelte';
	import Loader from './Loader.svelte';
	import GroupSelect from './GroupSelect.svelte';
	import RequestErrorUI from './RequestError.svelte';

	import X from '../icons/X.svelte';
	import Plus from '../icons/Plus.svelte';
	import Check from '../icons/Check.svelte';
	import Clipboard from '../icons/Clipboard.svelte';
	export let data: PageData;
	export let target: PageData['binds'][number] | null = null;
	export let onSave: () => void;
	export let trigger: () => void;
	export let serverId: string;

	let roleTrigger: () => void;
	let requirementTrigger: () => void;

	let name = '';
	let type = MellowBindType.DiscordRoles;
	let actionData: string[] = [];
	let requirements: [MellowBindRequirementType, string[]][] = [];
	let requirementsType = MellowBindRequirementsType.MeetAll;

	let saving = false;
	let editing = false;
	let saveError: RequestError | null = null;

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId])
		getGroupRoles(roleSearchId.toString());

	$: hasVerifiedType = requirements.some(i => i[0] === MellowBindRequirementType.HasVerifiedUserLink) ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;

	$: if (target && !editing) {
		name = target.name, type = target.type, actionData = target.data;
		requirements = target.requirements.map(item => [item.type, item.data]), requirementsType = target.requirements_type;
		editing = true;
		trigger();

		for (const [type, data] of requirements)
			if (type === MellowBindRequirementType.HasRobloxGroupRole || type === MellowBindRequirementType.HasRobloxGroupRankInRange || type === MellowBindRequirementType.InRobloxGroup)
				getGroupRoles(data[0]);
	}

	let itemRefs: HTMLDivElement[] = [];
	let lastItemRefLength = 0;
	$: {
		const length = itemRefs.filter(item => item).length;
		if (length > lastItemRefLength)
			itemRefs.findLast(item => item)?.scrollIntoView({ block: 'center' });
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
			const response = await fetch('?/update', {
				body: JSON.stringify({
					type: type === target.type ? undefined : type,
					name: newName === target.name ? undefined : newName,
					data: JSON.stringify(actionData) === JSON.stringify(target.data) ? undefined : actionData,
					target: target.id,
					requirements: JSON.stringify(newRequirements) === JSON.stringify(target.requirements.map(item => ({ type: item.type, data: item.data }))) ? undefined : newRequirements,
					requirementsType: requirementsType === target.requirements_type ? undefined : requirementsType
				}),
				method: 'POST'
			});
			const result = deserialize(await response.text());
			if (result.type === 'success') {
				data.binds = data.binds.map(item => item.id === target!.id ? result.data as any : item);
				saving = false;
				trigger();
				resetAdd();
			} else if (result.type === 'failure')
				saving = !(saveError = result.data as any);
			else if (result.type === 'error')
				saving = !(saveError = { error: RequestErrorType.Offline });
		} else {
			const response = await createMellowServerRobloxLink(data.session!.access_token, serverId, {
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
				trigger();
				resetAdd();
				setTimeout(onSave, 100);
			} else
				saving = !(saveError = response);
		}
		target = null;
		editing = false;
	};
	const addRequirement = (type: any) => requirements = [...requirements, [type, []]];
	const resetAdd = () => {
		actionData = [], name = '', requirements = [];
		type = MellowBindType.DiscordRoles, requirementsType = MellowBindRequirementsType.MeetAll;
		target = null;
		editing = false;
	};
	const getGroupRoles = (id: string) => fetch(`/api/roblox/group-roles?id=${id}`)
		.then(response => response.json() as Promise<RobloxGroupRole[]>)
		.then(data => groupRoles[id] = data.filter(role => role.rank).sort((a, b) => b.rank - a.rank));
</script>

<Modal bind:trigger>
	<h1>{$t(`mellow_link_editor.header.${!!target}`)}</h1>

	<div class="field">
		<p class="modal-label">{$t('mellow_link_editor.name')}</p>
		<TextInput bind:value={name} placeholder="Unnamed Action"/>
	</div>

	<p class="modal-label">{$t('mellow_link_editor.requirements')}</p>
	<div class="requirements">
		<div class="fields">
			<Select.Root bind:value={requirementsType}>
				{#each Object.values(MellowBindRequirementsType) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`mellow_bind.requirements_type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
			<DropdownMenu.Root bind:trigger={requirementTrigger}>
				<Button slot="trigger" on:click={requirementTrigger}>
					<Plus/>{$t('action.create_new')}
				</Button>
				<p>{$t('mellow_link_editor.requirements')}</p>
				{#each Object.values(MellowBindRequirementType) as type}
					{#if typeof type === 'number' && (type || !hasVerifiedType)}
						<button type="button" on:click={() => addRequirement(type)}>
							{$t(`mellow_bind.requirement.${type}`)}
						</button>
					{/if}
				{/each}
			</DropdownMenu.Root>
		</div>
		{#each requirements as item, index}
			<div class="item" class:highlighted={index === requirements.length - 1} bind:this={itemRefs[index]}>
				<div class="rfields">
					<p class="title">{$t(`mellow_bind.requirement.${item[0]}`)}</p>
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRole}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]} onChange={value => roleSearchId = value}/>
							</div>
							{#if groupRoles[item[1][0]]}
								<div class="field">
									<p class="label">{$t('mellow_link_editor.requirement.group_role')}</p>
									<Select.Root bind:value={item[1][1]} placeholder={$t('mellow_link_editor.requirement.group_role.placeholder')}>
										{#each groupRoles[item[1][0]] as role}
											<Select.Item value={role.id.toString()}>
												{role.name}
											</Select.Item>
										{/each}
									</Select.Root>
								</div>
							{:else if item[1][0]}
								<Loader/>
							{/if}
						</div>
					{:else if item[0] === MellowBindRequirementType.HasRobloxGroupRankInRange}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]}/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.rank_from')}</p>
								<TextInput bind:value={item[1][1]} placeholder="Rank"/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow_link_editor.requirement.rank_to')}</p>
								<TextInput bind:value={item[1][2]} placeholder="Rank"/>
							</div>
						</div>
					{:else if item[0] === MellowBindRequirementType.InRobloxGroup}
						<GroupSelect bind:value={item[1][0]}/>
					{:else if item[0] === MellowBindRequirementType.MeetsOtherLink}
						<Select.Root bind:value={item[1][0]} placeholder={$t('mellow_link_editor.requirement.link.placeholder')}>
							{#each data.binds.filter(bind => bind.id !== target?.id && !requirements.some(r => r !== item && r[0] === MellowBindRequirementType.MeetsOtherLink && r[1][0] === bind.id)) as bind}
								<Select.Item value={bind.id}>
									{bind.name}
								</Select.Item>
							{/each}
						</Select.Root>
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
			<Select.Root bind:value={type}>
				<p>{$t('mellow_link_editor.type.category')}</p>
				{#each Object.values(MellowBindType) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`mellow_bind.type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
	
		{#if type === MellowBindType.DiscordRoles}
			<div class="field">
				<p class="modal-label">{$t('mellow_link_editor.discord_roles')}</p>
				<div class="roles">
					{#each actionData as item}
						<button class="item focusable" type="button" title={$t('action.remove')} on:click={() => actionData = actionData.filter(i => i !== item)}>
							{data?.roles.find(role => role.id === item)?.name}
						</button>
					{/each}
					<DropdownMenu.Root bind:trigger={roleTrigger}>
						<button class="item" slot="trigger" on:click={roleTrigger}>
							<Plus/>
						</button>
						<p>{$t('mellow_link_editor.discord_roles.category')}</p>
						{#each data?.roles.filter(role => !actionData.includes(role.id)) as item}
							<button type="button" on:click={() => actionData = [...actionData, item.id]}>
								{item.name}
							</button>
						{/each}
						<p>{$t('mellow_link_editor.discord_roles.options')}</p>
						<button type="button" on:click={() => actionData = data.roles.map(role => role.id)}>
							{$t('mellow_link_editor.discord_roles.add_all')}
						</button>
					</DropdownMenu.Root>
				</div>
			</div>
		{:else if type === MellowBindType.BanDiscord || type === MellowBindType.KickDiscord}
			<div class="field">
				<p class="modal-label">{$t('label.audit_reason')}</p>
				<TextInput bind:value={actionData[0]} placeholder={$t('label.reason')}/>
			</div>
		{/if}
	</div>

	<RequestErrorUI data={saveError}/>
	<p class="explanation">{$t(`mellow_bind.explanation.${type}`, [actionData])} {$t(`mellow_bind.explanation.end.${requirementsType}`, [requirements.length])}</p>
	<div class="modal-buttons">
		<Button on:click={save} disabled={saving}>
			<Check/>{$t(target ? 'action.save_changes' : 'mellow_link_editor.finish')}
		</Button>
		<form method="dialog">
			<Button on:click={resetAdd} disabled={saving}>
				<X/>{$t('action.cancel')}
			</Button>
		</form>
	</div>
</Modal>

<style lang="scss">
	.requirements {
		gap: 8px;
		flex: 0 1 auto;
		display: flex;
		margin-bottom: 16px;
		flex-direction: column;
		.item {
			gap: 24px;
			display: flex;
			padding: 12px 16px;
			background: var(--background-primary);
			border-radius: 8px;
			.title {
				margin: auto 0;
				font-size: .9em;
			}
			.rfields {
				gap: 16px;
				display: flex;
				flex-direction: column;
				.field .label {
					color: var(--color-secondary);
					margin: 0 0 6px;
					font-size: .9em;
				}
			}
			.buttons {
				gap: 16px;
				margin: 0 0 0 auto;
				display: flex;
				button {
					color: var(--color-tertiary);
					border: none;
					cursor: pointer;
					height: fit-content;
					padding: 0;
					display: flex;
					background: none;
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

	.roles {
		gap: 4px;
		flex: 0 1 auto;
		display: flex;
		flex-wrap: wrap;
		max-width: 512px;
		.item {
			color: var(--color-tertiary);
			height: 28px;
			border: none;
			cursor: pointer;
			display: flex;
			padding: 0 12px;
			font-size: .8em;
			background: var(--background-primary);
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 16px;
			&:hover {
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
		}
		:global(.content) {
			overflow: auto;
			max-height: 192px;
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
		margin: 32px 0 8px;
		font-size: .9em;
	}
	.modal-buttons {
		gap: 16px;
		display: flex;
	}
</style>