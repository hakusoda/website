<script lang="ts">
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { mellowLinkViewMode } from '$lib/settings';
	import type { RequestError, RobloxGroupRole } from '$lib/types';
	import { RequestErrorType, MellowLinkListViewMode } from '$lib/enums';
	import { MellowBindType, MellowLinkImportType, MellowBindRequirementType, MellowBindRequirementsType } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import GroupSelect from '$lib/components/GroupSelect.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	export let data: PageData;

	let trigger: () => void;
	let bindData: string[] = [];
	let bindName = 'Unnamed Link';
	let bindType = MellowBindType.DiscordRoles;
	let createError: RequestError | null = null;
	let creatingBind = false;
	let requirements: [MellowBindRequirementType, string[]][] = [];
	let linksContainer: HTMLDivElement;
	let requirementsType = MellowBindRequirementsType.MeetAll;
	let requirementTrigger: () => void;

	let roleTrigger: () => void;

	let importType: MellowLinkImportType | null = null;
	let importTarget: string | null = null;
	let importTrigger: () => void;

	$: hasVerifiedType = requirements.some(i => i[0] === MellowBindRequirementType.HasVerifiedUserLink) ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;
	const createBind = async () => {
		createError = null;
		creatingBind = true;
		const response = await fetch('?/create', {
			body: JSON.stringify({
				name: bindName,
				data: bindData,
				type: bindType,
				requirements: requirements.map(item => ({
					type: item[0],
					data: item[1]
				})),
				requirementsType
			}),
            method: 'POST'
        });
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			data.binds = [...data.binds, result.data as any];
			creatingBind = false;
			trigger();
			resetAdd();
			setTimeout(() => linksContainer.scrollTo({ top: linksContainer.scrollHeight, behavior: 'smooth' }), 100);
		} else if (result.type === 'failure')
			creatingBind = !(createError = result.data as any);
		else if (result.type === 'error')
			creatingBind = !(createError = { error: RequestErrorType.Offline });
	};
	const deleteBind = async (id: string) => {
		const response = await fetch('?/delete', {
			body: id,
            method: 'POST'
        });
		if (response.status === 200)
			data.binds = data.binds.filter(bind => bind.id !== id);
	};
	const addRequirement = (type: any) => {
		requirements = [...requirements, [type, []]];
	};
	const resetAdd = () => {
		bindData = [], bindName = 'Unnamed Link', requirements = [];
		bindType = MellowBindType.DiscordRoles;
	};

	let groupRoles: Record<string, RobloxGroupRole[]> = {};
	let roleSearchId: string | null = null;
	$: if (roleSearchId && !groupRoles[roleSearchId]) {
		const id = roleSearchId.toString();
		fetch(`/api/roblox/group-roles?id=${id}`)
			.then(response => response.json())
			.then(data => groupRoles[id] = data);
	}

	let bindFilter = '';

	$: compact = $mellowLinkViewMode === MellowLinkListViewMode.Compact;
</script>

<div class="main">
	<div class="binds" bind:this={linksContainer}>
		{#each data.binds.filter(item => item.name.toLowerCase().includes(bindFilter)) as item}
			<div class="item" class:compact>
				<div class="name">
					<h1>{item.name}</h1>
					{#if !compact}
						<p>{$t('mellow_bind.creator')} <a href={`/user/${item.creator.username}`}>{item.creator.name ?? item.creator.username}</a>, {$t('time_ago', [item.created_at])}</p>
					{/if}
					<p>{$t(`mellow_bind.explanation.${item.type}`, [item.target_ids])} {$t(`mellow_bind.explanation.end.${item.requirements_type}`, [item.requirements.length])}</p>
				</div>
				<div class="buttons">
					<Button title="coming soon!!!" disabled>{$t('action.edit')}</Button>
					<Button on:click={() => deleteBind(item.id)}><Trash/></Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="fade"/>
	<div class="buttons">
		<Button on:click={trigger}>
			<Plus/>{$t('mellow.server.settings.roblox.binds.create.button')}
		</Button>
		<DropdownMenu bind:trigger={importTrigger}>
			<Button slot="trigger" on:click={importTrigger} title="coming soon!!!" disabled>
				<Plus/>{$t('mellow.server.settings.roblox.binds.import')}
			</Button>
			<p>{$t('mellow.server.settings.roblox.binds.import.category')}</p>
			{#each Object.values(MellowLinkImportType) as type}
				{#if typeof type === 'number'}
					<button type="button" on:click={() => importType = +type}>
						{$t(`mellow.server.settings.roblox.binds.import.type.${type}`)}
					</button>
				{/if}
			{/each}
		</DropdownMenu>
		<TextInput bind:value={bindFilter} placeholder={$t('action.search')}/>
		<Select.Root bind:value={$mellowLinkViewMode}>
			{#each Object.values(MellowLinkListViewMode) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_bind.view_mode.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>
	</div>
</div>

<Modal bind:trigger>
	<h1>{$t('mellow.server.settings.roblox.binds.create')}</h1>

	<div class="fields">
		<div class="field">
			<p class="modal-label">{$t('mellow.server.settings.roblox.binds.create.name')}</p>
			<TextInput bind:value={bindName}/>
		</div>

		<div class="field">
			<p class="modal-label">{$t('mellow.server.settings.roblox.binds.create.type')}</p>
			<Select.Root bind:value={bindType}>
				<p>{$t('mellow.server.settings.roblox.binds.create.type.category')}</p>
				{#each Object.values(MellowBindType) as item}
					{#if typeof item === 'number'}
						<Select.Item value={item}>
							{$t(`mellow_bind.type.${item}`)}
						</Select.Item>
					{/if}
				{/each}
			</Select.Root>
		</div>
	</div>

	{#if bindType === MellowBindType.DiscordRoles}
		<p class="modal-label">{$t('mellow.server.settings.roblox.binds.create.discord_roles')}</p>
		<div class="roles">
			{#each bindData as item}
				<button class="item focusable" type="button" title={$t('action.remove')} on:click={() => bindData = bindData.filter(i => i !== item)}>
					{data.roles.find(role => role.id === item)?.name}
				</button>
			{/each}
			<DropdownMenu bind:trigger={roleTrigger}>
				<button class="item" slot="trigger" on:click={roleTrigger}>
					<Plus/>
				</button>
				<p>{$t('mellow.server.settings.roblox.binds.create.discord_roles.category')}</p>
				{#each data.roles.filter(role => !bindData.includes(role.id)) as item}
					<button type="button" on:click={() => bindData = [...bindData, item.id]}>
						{item.name}
					</button>
				{/each}
				<p>{$t('mellow.server.settings.roblox.binds.create.discord_roles.options')}</p>
				<button type="button" on:click={() => bindData = data.roles.map(role => role.id)}>
					{$t('mellow.server.settings.roblox.binds.create.discord_roles.add_all')}
				</button>
			</DropdownMenu>
		</div>
	{/if}

	<p class="modal-label">{$t('mellow.server.settings.roblox.binds.create.requirements')}</p>
	<div class="requirements">
		<Select.Root bind:value={requirementsType}>
			{#each Object.values(MellowBindRequirementsType) as item}
				{#if typeof item === 'number'}
					<Select.Item value={item}>
						{$t(`mellow_bind.requirements_type.${item}`)}
					</Select.Item>
				{/if}
			{/each}
		</Select.Root>
		{#each requirements as item}
			<div class="item">
				<div class="rfields">
					<p class="title">{$t(`mellow_bind.requirement.${item[0]}`)}</p>
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRole}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]} onChange={value => roleSearchId = value}/>
							</div>
							{#if groupRoles[item[1][0]]}
								<div class="field">
									<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group_role')}</p>
									<Select.Root bind:value={item[1][1]} placeholder={$t('mellow.server.settings.roblox.binds.create.requirement.group_role.placeholder')}>
										{#each groupRoles[item[1][0]] as role}
											<Select.Item value={role.id.toString()}>
												{role.name}
											</Select.Item>
										{/each}
									</Select.Root>
								</div>
							{/if}
						</div>
					{/if}
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRankInRange}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group')}</p>
								<GroupSelect bind:value={item[1][0]}/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.rank_from')}</p>
								<TextInput bind:value={item[1][1]} placeholder="Rank"/>
							</div>
							<div class="field">
								<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.rank_to')}</p>
								<TextInput bind:value={item[1][2]} placeholder="Rank"/>
							</div>
						</div>
					{/if}
				</div>
				<button type="button" on:click={() => requirements = requirements.filter(i => i !== item)}>
					<X/>
				</button>
			</div>
		{/each}
	</div>
	<DropdownMenu bind:trigger={requirementTrigger}>
		<Button slot="trigger" on:click={requirementTrigger}>
			<Plus/>{$t('mellow.server.settings.roblox.binds.create.requirements.add')}
		</Button>
		<p>{$t('mellow.server.settings.roblox.binds.create.requirements')}</p>
		{#each Object.values(MellowBindRequirementType) as type}
			{#if typeof type === 'number' && (type || !hasVerifiedType)}
				<button type="button" on:click={() => addRequirement(type)}>
					{$t(`mellow_bind.requirement.${type}`)}
				</button>
			{/if}
		{/each}
	</DropdownMenu>

	<RequestErrorUI data={createError}/>
	<p class="explanation">{$t(`mellow_bind.explanation.${bindType}`, [bindData])} {$t(`mellow_bind.explanation.end.${requirementsType}`, [requirements.length])}</p>
	<div class="modal-buttons">
		<Button on:click={createBind} disabled={creatingBind}>
			<Check/>{$t('mellow.server.settings.roblox.binds.create.finish')}
		</Button>
		<form method="dialog">
			<Button on:click={resetAdd} disabled={creatingBind}>
				<X/>{$t('action.cancel')}
			</Button>
		</form>
	</div>
</Modal>

{#if importType === MellowLinkImportType.RobloxGroupRolesToDiscordRoles}
	<Modal autoOpen>
		<p class="modal-label">{$t('group_select')}</p>
		<GroupSelect bind:value={importTarget}/>
	</Modal>
{/if}

<style lang="scss">
	.main {
		width: 100%;
		margin: 0px 192px 32px 64px;
		display: flex;
		position: relative;
		flex-direction: column;
		.binds {
			gap: 16px;
			height: 100%;
			display: flex;
			padding: 32px 0;
			overflow: auto;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 16px 16px 24px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 16px;
				.name {
					h1 {
						margin: 0 0 6px;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .75em;
					}
				}
				.buttons {
					gap: 16px;
					display: flex;
					margin-left: auto;
				}
				&.compact {
					padding: 8px 16px;
					border-radius: 8px;
					.name {
						font-size: .9em;
						h1 {
							margin-bottom: 4px;
						}
					}
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
			display: flex;
			margin-top: 16px;
			:global(input) {
				margin-left: auto;
			}
		}
	}

	.requirements {
		gap: 8px;
		flex: 0 1 auto;
		display: flex;
		margin-bottom: 8px;
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
			& > button {
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				margin: 0 0 0 auto;
				height: fit-content;
				padding: 0;
				display: flex;
				background: none;
			}
		}
	}

	.fields {
		gap: 16px;
		display: flex;
		.field p {
			margin-top: 0;
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