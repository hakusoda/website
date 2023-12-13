<script lang="ts">
	import { Tabs, Button, Select, TextInput, DropdownMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { hasBit } from '$lib/util';
	import { leaveTeam } from '$lib/api';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { TeamFlag, TeamRolePermission } from '$lib/enums';

	import Avatar from '$lib/components/Avatar.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import TeamInvite from '$lib/modals/TeamInvite.svelte';

	import Star from '$lib/icons/Star.svelte';
	import Link from '$lib/icons/Link.svelte';
	import Person from '$lib/icons/Person.svelte';
	import People from '$lib/icons/People.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import StarFill from '$lib/icons/StarFill.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	import PatchCheckFill from '$lib/icons/PatchCheckFill.svelte';
	import ClipboardPlusFill from '$lib/icons/ClipboardPlusFill.svelte';
	import ThreeDotsVertical from '$lib/icons/ThreeDotsVertical.svelte';
	export let data: PageData;

	let tab = 0;
	let dropdownTrigger: () => void;

	let memberSort = 0;
	let memberFilter = '';

	const leave = async () => {
		const response = await leaveTeam(data.id);
		if (response.success)
			invalidateAll();
		else
			alert($t(`request_error.${response.error as 0}`))
	};
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar id={data.id} src={data.avatar_url} hover/>
			<div class="name">
				<h1>
					{data.display_name}
					{#each data.parent_affiliations as item}
						<a href={`/team/${item.team.name}`}>
							<Avatar src={item.team.avatar_url} size="xs" transparent/>
						</a>
					{/each}
					{#if hasBit(data.flags, TeamFlag.Verified)}
						<p><PatchCheckFill size={32}/></p>
					{/if}
				</h1>
				<p>@{data.name}</p>
			</div>
		</div>
		<div class="sub-header">
			{#if data.website_url}
				<a href={data.website_url}>
					<Link/>
					{data.website_url.replace(/^https?:\/\//g, '').replace(/\#.*$|\/$/g, '').replace(/^www\./, '').replace(/^(.*?\/.*?\/).*?(\/.+)/, (_, a, b) => `${a}...${b}`)}
				</a>
			{/if}
			<div class="buttons">
				{#if data.user && (data.owner?.id === data.user.id || data.members.some(member => member.id === data.user?.id && member.role && hasBit(member.role.permissions, TeamRolePermission.ManageTeam)))}
					<Button href={`/team/${data.name}/dashboard/profile`}>
						<GearFill/>{$t('action.manage')}
					</Button>
				{/if}
				<DropdownMenu.Root bind:trigger={dropdownTrigger}>
					<Button slot="trigger" circle on:click={dropdownTrigger}>
						<ThreeDotsVertical/>
					</Button>
					<p>{data.display_name} (@{data.name})</p>
					{#if data.user && data.user.id !== data.owner?.id && data.members.some(member => member.id === data.user?.id)}
						<button type="button" on:click={leave}>
							<BoxArrowRight/>{$t('action.leave_team')}
						</button>
						<div class="separator"/>
					{/if}
					<button type="button" on:click={() => navigator.clipboard.writeText(data.id)}>
						<ClipboardPlusFill/>{$t('action.copy_id')}
					</button>
				</DropdownMenu.Root>
			</div>
		</div>
		{#if data.bio}
			<div class="separator"/>
			<Markdown source={data.bio}/>
		{/if}
		{#if data.affiliations.length || data.parent_affiliations.length}
			<div class="separator"/>
			<div class="detail">
				<People/>
				<p>{$t('team.affiliations')}</p>
			</div>
			<div class="affiliations">
				{#each [...data.affiliations, ...data.parent_affiliations].sort((a, b) => a.team.display_name.localeCompare(b.team.display_name)) as item}
					<a href={`/team/${item.team.name}`}>
						<Avatar src={item.team.avatar_url} size="xxs" transparent/>
						{item.team?.display_name}
					</a>
				{/each}
			</div>
		{/if}
		<div class="separator"/>
		<div class="detail">
			<Person/>
			<p>
				{$t(`team.owner.${!!data.owner}`)}
				{#if data.owner}
					<a href={`/user/${data.owner.username}`}>
						{data.owner.name || `@${data.owner.username}`}
					</a>
				{/if}
			</p>
		</div>
		<div class="detail">
			<Sunrise/>
			<p>
				{$t(`team.created.${!!data.creator}`, [data.created_at])}
				{#if data.creator}
					<a href={`/user/${data.creator.username}`}>
						{data.creator.name || `@${data.creator.username}`}
					</a>
				{/if}
			</p>
		</div>
		<div class="separator"/>
		<div class="detail">
			<Star/>
			<p>{$t('team.id', [data.id])}</p>
		</div>
	</div>
	<Tabs.Root bind:value={tab}>
		<Tabs.Item title={$t('team.members', [data.members.length])} value={0}>
			<div class="members-options">
				<TextInput bind:value={memberFilter} placeholder={$t('label.search.members')}/>
				
				<p>{$t('sort_by')}</p>
				<Select.Root bind:value={memberSort}>
					<Select.Item value={0}>
						{$t('sort_by.name')}
					</Select.Item>
					<Select.Item value={1}>
						{$t('sort_by.join_date')}
					</Select.Item>
				</Select.Root>
			</div>
			<div class="members">
				{#each data.members.filter(item => item.name?.toLowerCase().includes(memberFilter.toLowerCase()) || item.username.toLowerCase().includes(memberFilter.toLowerCase())).sort((a, b) => memberSort ? Date.parse(b.joined_at) - Date.parse(a.joined_at) : 0) as item}
					<a class="member" href={`/user/${item.username}`}>
						<Avatar id={item.id} src={item.avatar_url} size="sm2" hover circle/>
						<div class="name">
							<h1>
								{#if item.id === data.owner?.id}
									<StarFill size={20}/>
								{/if}
								{item.name ?? item.username}
							</h1>
							<p>@{item.username}</p>
						</div>
						<div class="details">
							<p>{item.role?.name ?? $t('team_role.unknown')}</p>
							<p>{$t('profile.joined', [item.joined_at])}</p>
						</div>
					</a>
				{/each}
			</div>
		</Tabs.Item>
	</Tabs.Root>
</div>

{#if data.invite}
	<TeamInvite
		id={data.id}
		name={data.display_name}
		data={data.invite}
		avatar={data.avatar_url}
		userAvatar={data.user?.avatar_url}
	/>
{/if}

<svelte:head>
	<title>{data.display_name}</title>
	<meta content={data.display_name} property="og:title">
	<meta content={data.bio} property="og:description">
	<meta content={data.avatar_url} property="og:image">
	<meta name="og:type" content="profile">
	<meta property="profile:username" content={data.name}>
</svelte:head>

<style lang="scss">
	.main {
		gap: 32px;
		margin: 128px 32px 64px;
		display: flex;
		flex-wrap: wrap;
		.card {
			flex: 1 1 20%;
			height: fit-content;
			padding: 24px;
			position: relative;
			min-width: 416px;
			background: var(--background-secondary);
			padding-top: 32px;
			border-radius: 20px;
			.header {
				gap: 32px;
				top: -96px;
				width: calc(100vw - 128px);
				display: flex;
				position: absolute;
				align-items: center;
				.name {
					margin-bottom: 16px;
					h1 {
						gap: 16px;
						margin: 0;
						display: flex;
						overflow: hidden;
						font-size: 2.5em;
						white-space: nowrap;
						align-items: center;
						text-overflow: ellipsis;
						:global(svg) {
							color: var(--color-verified);
						}
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
					}
				}
			}
			.sub-header {
				display: flex;
				align-items: end;
				a {
					color: var(--color-link);
					margin: 0 16px 0 0;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
					:global(svg) {
						color: var(--color-primary);
						margin: 0 8px 0 0;
						min-width: 16px;
					}
				}
				.buttons {
					gap: 8px;
					display: flex;
					margin-left: auto;
				}
			}
			& > .separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.detail {
				gap: 8px;
				width: fit-content;
				display: flex;
				position: relative;
				align-items: end;
				margin-bottom: 12px;
				p {
					color: var(--color-secondary);
					margin: 0;
					white-space: nowrap;
				}
			}
			.affiliations {
				gap: 8px;
				display: flex;
				flex-direction: column;
				a {
					gap: 8px;
					width: fit-content;
					display: flex;
					align-items: center;
				}
			}
		}
		:global(.tabs-container) {
			flex: 1 1 40%;
		}
		.members-options {
			margin: 0 0 16px;
			display: flex;
			align-items: center;
			p {
				color: var(--color-secondary);
				margin: 0 16px 0 auto;
				font-size: .9em;
			}
		}
		.members {
			gap: 16px 32px;
			display: flex;
			flex-wrap: wrap;
			.member {
				flex: 1 1 calc(50% - 48px);
				display: flex;
				padding: 16px;
				position: relative;
				margin-top: 32px;
				background: var(--background-secondary);
				border-radius: 16px;
				flex-direction: column;
				text-decoration: none;
				:global(.avatar) {
					top: -24px;
					left: 16px;
					position: absolute;
				}
				.name {
					margin-left: 88px;
					h1 {
						gap: 10px;
						margin: 0;
						display: flex;
						font-size: 1.4em;
						font-weight: 700;
						align-items: center;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.details {
					gap: 24px;
					display: flex;
					margin-top: 24px;
					white-space: nowrap;
					justify-content: space-between;
					p {
						color: var(--color-secondary);
						margin: 0;
						font-size: .9em;
					}
				}
			}
		}
	}
	@media (max-width: 512px) {
		.main {
			margin: 128px 0 64px;
			.card {
				width: 100%;
				border-radius: 0;
			}
			:global(.tabs-container .buttons) {
				border-radius: 0 !important;
			}
			.members .member {
				border-radius: 0;
			}
		}
	}
</style>