<script lang="ts">
	import { get, writable } from 'svelte/store';
	import { Button, Select, TextInput, DropdownMenu } from '@voxelified/voxeliface';
	import type { Writable } from 'svelte/store';

	import { t } from '$lib/localisation';
	import { MellowBindRequirementType, MellowBindType } from '$lib/enums';
	import type { PageData } from './$types';

	import Modal from '$lib/components/Modal.svelte';

	import X from '$lib/icons/X.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Trash from '$lib/icons/Trash.svelte';
	export let data: PageData;

	let trigger: () => void;
	let bindData: string[] = [];
	let bindName = 'Unnamed Binding';
	let bindType = writable(MellowBindType.DiscordRoles);
	let createError = '';
	let roleTrigger: () => void;
	let creatingBind = false;
	let requirements: [Writable<MellowBindRequirementType>, string[]][] = [];

	$: hasVerifiedType = requirements.some(i => get(i[0]) === MellowBindRequirementType.HasVerifiedUserLink) ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;
	const createBind = async () => {
		createError = '';
		creatingBind = true;
		const response = await fetch('?/create', {
			body: JSON.stringify({
				name: bindName,
				data: bindData,
				type: get(bindType),
				requirements: requirements.map(item => ({
					data: item[1],
					type: get(item[0])
				}))
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
	const addRequirement = () => {
		const type = hasVerifiedType ? MellowBindRequirementType.HasRobloxGroupRole : MellowBindRequirementType.HasVerifiedUserLink;
		requirements = [...requirements, [writable(type), []]];
	};
	const resetAdd = () => {
		bindData = [], bindName = 'Unnamed Binding', requirements = [];
		bindType.set(MellowBindType.DiscordRoles);
	};
</script>

<div class="main">
	<p>this page is unfinished...</p>
	<div class="binds">
		{#each data.binds as item}
			<div class="item">
				<div class="name">
					<h1>{item.name}</h1>
					<p>{$t(`mellow_bind.bound.${item.type}`, [item.target_ids.length])} • {$t('mellow_bind.requirements', [item.requirements.length])}</p>
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
			<Select.Root value={bindType}>
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

	{#if $bindType === MellowBindType.DiscordRoles}
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
				<p>{$t('mellow.server.settings.roblox.binds.create.discord_roles')}</p>
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
		{#each requirements as item}
			<div class="item">
				<div class="field">
					<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement')}</p>
					<Select.Root value={item[0]}>
						{#each Object.values(MellowBindRequirementType) as type}
							{#if typeof type === 'number' && (type || !hasVerifiedType || get(item[0]) === MellowBindRequirementType.HasVerifiedUserLink)}
								<Select.Item value={type}>
									{$t(`mellow_bind.requirement.${type}`)}
								</Select.Item>
							{/if}
						{/each}
					</Select.Root>
				</div>
				{#if get(item[0]) === MellowBindRequirementType.HasRobloxGroupRole}
					<div class="field">
						<p class="label">{$t('mellow.server.settings.roblox.binds.create.requirement.group_role')}</p>
						<TextInput bind:value={item[1][0]} placeholder="search to come later..."/>
					</div>
				{/if}
				<Button on:click={() => requirements = requirements.filter(i => i !== item)}>
					<Trash/>
				</Button>
			</div>
		{/each}
	</div>
	<Button on:click={addRequirement}>
		<Plus/>{$t('mellow.server.settings.roblox.binds.create.requirements.add')}
	</Button>

	{#if createError}
		<p>{createError}</p>
	{/if}
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
		overflow: auto;
		max-height: 168px;
		margin-bottom: 8px;
		flex-direction: column;
		.item {
			gap: 24px;
			display: flex;
			padding: 12px 16px;
			background: var(--background-primary);
			border-radius: 8px;
			.field {
				.label {
					color: var(--color-secondary);
					margin: 0 0 8px;
					font-size: .9em;
				}
			}
			:global(.button) {
				margin: auto 0 0 auto;
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
		overflow: auto;
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

	.modal-label {
		color: var(--color-secondary);
		margin: 0 0 8px;
		&:not(:nth-child(2)) {
			margin-top: 24px;
		}
	}
	.modal-buttons {
		gap: 16px;
		display: flex;
		margin-top: 24px;
	}
</style>