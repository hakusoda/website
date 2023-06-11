<script lang="ts">
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import type { RobloxGroupRole, PartialRobloxGroup } from '$lib/types';
	import { MellowBindType, MellowBindRequirementType, MellowBindRequirementsType } from '$lib/enums';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	import ChevronDown from '$lib/icons/ChevronDown.svelte';
	export let data: PageData;

	let trigger: () => void;
	let bindData: string[] = [];
	let bindName = 'Unnamed Link';
	let bindType = MellowBindType.DiscordRoles;
	let groupSearch = '';
	let createError = '';
	let creatingBind = false;
	let requirements: [MellowBindRequirementType, string[]][] = [];
	let requirementsType = MellowBindRequirementsType.MeetAll;
	let requirementTrigger: () => void;

	let filterRoles = '';
	let roleTrigger: () => void;
	let roleReqType = 0;
	let roleSearchId = 0;
	let roleReqIndex = 0;
	let groupRoleTrigger: () => void;
	let groupRoleModalTrigger: () => void;

	$: hasVerifiedType = requirements.some(i => i[0] === MellowBindRequirementType.HasVerifiedUserLink) ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;
	const createBind = async () => {
		createError = '';
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
		if (response.status === 200) {
			location.reload();
		} else
			creatingBind = !(createError = (await response.json()).error.message);
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

	let groupRoles: RobloxGroupRole[] = [];
	let foundGroups: (PartialRobloxGroup & { icon: string })[] = [];
	$: if (groupSearch) {
		const body = groupSearch;
		setTimeout(async () => {
			if (groupSearch === body) {
				const response = await fetch('?/searchGroups', {
					body,
					method: 'POST'
				});
				
				const result = deserialize(await response.text());
				foundGroups = result.type === 'success' ? result.data as any : [];
			}
		}, 1000);
	}

	$: if (roleSearchId)
		fetch('?/getRoles', {
			body: roleSearchId.toString(),
			method: 'POST'
		}).then(async response => {
			const result = deserialize(await response.text());
			groupRoles = result.type === 'success' ? result.data as any : [];
		});
</script>

<div class="main">
	<p>this page is unfinished...</p>
	<div class="binds">
		{#each data.binds as item}
			<div class="item">
				<div class="name">
					<h1>{item.name}</h1>
					<p>{$t(`mellow_bind.bound.${item.type}`, [item.target_ids.length])} • {$t('mellow_bind.requirements', [item.requirements.length])}</p>
					<p>{$t(`mellow_bind.explanation.${item.type}`, [item.target_ids])} {$t(`mellow_bind.explanation.end.${item.requirements_type}`, [item.requirements.length])}</p>
				</div>
				<div class="buttons">
					<Button>{$t('action.edit')}</Button>
					<Button on:click={() => deleteBind(item.id)}><Trash/></Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="buttons">
		<Button on:click={trigger}>
			<Plus/>{$t('mellow.server.settings.roblox.binds.create.button')}
		</Button>
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
				<button class="item focusable" type="button" on:click={() => bindData = bindData.filter(i => i !== item)}>
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
		{#each requirements as item, index}
			<div class="item">
				<div class="rfields">
					<p class="title">{$t(`mellow_bind.requirement.${item[0]}`)}</p>
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRole}
						<div class="field">
							<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group_role')}</p>
							<DropdownMenu bind:trigger={groupRoleTrigger}>
								<button class="group-role" type="button" slot="trigger" on:click={groupRoleTrigger}>
									{item[1][0] ?? 'None'}
									<ChevronDown/>
								</button>
								<p>Recent Groups</p>
								{#each JSON.parse(localStorage.getItem('recent-bind-groups') || '[]') || [] as item}
									<button type="button" on:click={() => (roleReqIndex = index, roleReqType = 0, roleSearchId = item.id)}>
										<Avatar src={item.icon} size="xxxs"/>
										{item.name}
									</button>
								{/each}
								<button type="button" on:click={() => {
									roleReqIndex = index, roleReqType = 0;
									groupRoleModalTrigger();
								}}>
									Search
								</button>
							</DropdownMenu>
						</div>
					{/if}
					{#if item[0] === MellowBindRequirementType.HasRobloxGroupRankInRange}
						<div class="fields">
							<div class="field">
								<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group')}</p>
								<DropdownMenu bind:trigger={groupRoleTrigger}>
									<button class="group-role" type="button" slot="trigger" on:click={groupRoleTrigger}>
										{item[1][0] ?? 'None'}
										<ChevronDown/>
									</button>
									<p>Recent Groups</p>
									{#each JSON.parse(localStorage.getItem('recent-bind-groups') || '[]') || [] as item}
										<button type="button" on:click={() => requirements = requirements.map((i, j) => {
											if (j === index)
												return [i[0], [item.id.toString(), ...i[1].splice(1)]];
											return i;
										})}>
											<Avatar src={item.icon} size="xxxs"/>
											{item.name}
										</button>
									{/each}
									<button type="button" on:click={() => {
										roleReqIndex = index, roleReqType = 1;
										groupRoleModalTrigger();
									}}>
										Search
									</button>
								</DropdownMenu>
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

	{#if createError}
		<p>{createError}</p>
	{/if}
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

<Modal bind:trigger={groupRoleModalTrigger}>
	<h1>Search for Group</h1>
	<TextInput bind:value={groupSearch} placeholder="Search for Group"/>

	<p>found groupss:</p>
	<div class="groups">
		{#each foundGroups as item}
			<form method="dialog">
				<button class="item" on:click={() => {
					if (roleReqType)
						requirements[roleReqIndex][1][0] = item.id.toString();
					else
						roleSearchId = item.id;
					const value = JSON.parse(localStorage.getItem('recent-bind-groups') || '[]') || [];
					localStorage.setItem('recent-bind-groups', JSON.stringify([...value, item]));
				}}>
					<Avatar src={item.icon} size="xs" transparent/>
					<div class="name">
						<h1>{item.name}</h1>
						<p>{$t('mellow.server.settings.roblox.binds.create.group.details', [item])}</p>
					</div>
				</button>
			</form>
		{/each}
	</div>

	<form method="dialog">
		<Button>
			<X/>{$t('action.cancel')}
		</Button>
	</form>
</Modal>

{#if roleSearchId}
	<Modal autoOpen>
		<h1>Select Role</h1>
		<p class="modal-label">Filter</p>
		<TextInput bind:value={filterRoles}/>
		
		<div class="group-roles">
			{#each groupRoles.filter(role => role.name.toLowerCase().startsWith(filterRoles) && role.rank > 0) as item}
				<button class="item" type="button" on:click={() => (roleSearchId = 0, requirements[roleReqIndex][1][0] = item.id.toString())}>
					<h1>{item.name}</h1>
					<p>{$t('mellow.server.settings.roblox.binds.create.group_role.details', [item])}</p>
				</button>
			{/each}
		</div>

		<div class="modal-buttons">
			<Button on:click={() => {
				roleSearchId = 0;
				groupRoleModalTrigger();
			}}>
				<X/>Choose another Group
			</Button>
			<Button on:click={() => roleSearchId = 0}>
				<X/>{$t('action.cancel')}
			</Button>
		</div>
	</Modal>
{/if}

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 256px 32px 64px;
		.binds {
			gap: 16px;
			display: flex;
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
						font-size: .8em;
					}
				}
				.buttons {
					gap: 16px;
					display: flex;
					margin-left: auto;
				}
			}
		}
		& > .buttons {
			gap: 16px;
			display: flex;
			margin-top: 24px;
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

	.group-role {
		color: var(--color-primary);
		height: 32px;
		border: none;
		display: flex;
		padding: 0 16px;
		font-size: .75em;
		min-width: 192px;
		background: none;
		transition: box-shadow 0.25s;
		box-shadow: 0 0 0 1px var(--border-primary);
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 4px;
		justify-content: space-between;
		&:hover {
			box-shadow: 0 0 0 1px var(--border-secondary);
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
			font-size: .9em;
			background: var(--background-primary);
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 16px;
		}
		:global(.content) {
			overflow: auto;
			max-height: 192px;
		}
	}

	.groups {
		gap: 8px;
		display: flex;
		flex-direction: column;
		.item {
			width: 100%;
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			display: flex;
			padding: 8px 16px;
			font-size: 1em;
			text-align: start;
			background: var(--background-tertiary);
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 8px;
			.name {
				margin-left: 16px;
				h1 {
					margin: 0;
					font-size: 1em;
					font-weight: 500;
				}
				p {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .8em;
				}
			}
		}
	}

	.group-roles {
		gap: 8px;
		display: flex;
		margin-top: 8px;
		flex-direction: column;
		.item {
			width: 100%;
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 8px 16px;
			font-size: 1em;
			text-align: start;
			background: var(--background-tertiary);
			font-family: var(--font-primary);
			border-radius: 8px;
			h1 {
				margin: 0;
				font-size: 1em;
				font-weight: 500;
			}
			p {
				color: var(--color-secondary);
				margin: 4px 0 0;
				font-size: .8em;
			}
		}
	}

	.modal-label {
		color: var(--color-secondary);
		margin: 0 0 6px;
		font-size: .9em;
		&:not(:nth-child(2)) {
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