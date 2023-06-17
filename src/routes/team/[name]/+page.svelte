<script lang="ts">
	import { Tabs } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import Star from '$lib/icons/Star.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	export let data: PageData;

	let tab = 0;
</script>

<div class="main">
	<div class="card">
		<div class="header">
			<Avatar src={data.avatar_url} hover/>
			<h1>{data.display_name}</h1>
		</div>
		{#if data.bio}
			<div class="separator"/>
			{data.bio}
		{/if}
		<div class="separator"/>
		<div class="counter">
			<Sunrise/>
			<p>{$t('team.joined', [data.created_at])}</p>
		</div>
		<div class="separator"/>
		<div class="counter">
			<Star/>
			<p>{$t('team.id', [data.name])}</p>
		</div>
	</div>
	<Tabs.Root bind:value={tab}>
		<Tabs.Item title={$t('team.members')} value={0}>
			<div class="members">
				{#each data.members as item}
					<a class="member" href={`/user/${item.username}`}>
						<Avatar src={item.avatar_url} size="sm2" hover circle/>
						<div class="name">
							<h1>{item.name ?? item.username}</h1>
							<p>@{item.username}</p>
						</div>
						<div class="details">
							<p>{$t(`team_role.${item.role}`)}</p>
							<p>{$t('profile.joined', [item.joined_at])}</p>
						</div>
					</a>
				{/each}
			</div>
		</Tabs.Item>
		<Tabs.Item title={$t('team.projects')} value={1}>
			<div class="projects">
				{#each data.projects as item}
					<a class="item" href={`/project/${item.name}`} style={`--banner: url("${item.banner_url}")`}>
						<Avatar src={item.avatar_url} size="sm2" hover/>
						<div class="name">
							<h1>{item.display_name}</h1>
							<p>{item.summary}</p>
						</div>
						<div class="details">
							<p>{$t('project.card', [item.created_at, item.contributors.length + item.external_contributors])}</p>
						</div>
					</a>
				{/each}
			</div>
		</Tabs.Item>
	</Tabs.Root>
</div>

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
			border-radius: 16px;
			.header {
				gap: 32px;
				top: -96px;
				width: calc(100vw - 128px);
				display: flex;
				position: absolute;
				align-items: center;
				h1 {
					margin: 0;
					overflow: hidden;
					font-size: 2.5em;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
			.separator {
				width: 100%;
				height: 1px;
				margin: 16px 0;
				background: var(--border-secondary);
			}
			.counter {
				gap: 6px;
				width: fit-content;
				display: flex;
				position: relative;
				align-items: end;
				margin-bottom: 12px;
				p {
					color: var(--color-tertiary);
					margin: 0;
					white-space: nowrap;
				}
			}
		}
		:global(.tabs-container) {
			flex: 1 1 40%;
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
						margin: 0;
						font-size: 1.4em;
						font-weight: 700;
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
		.projects {
			gap: 16px 32px;
			display: flex;
			flex-direction: column;
			.item {
				flex: 1 1 calc(50% - 48px);
				display: flex;
				padding: 16px;
				position: relative;
				margin-top: 32px;
				background: var(--background-secondary);
				border-radius: 16px;
				flex-direction: column;
				text-decoration: none;
				&:before {
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					opacity: .5;
					content: '';
					display: block;
					position: absolute;
					background: no-repeat center/cover var(--banner);
					mask-image: linear-gradient(to bottom, #fff -40%, #ffffff00 80%);
					border-radius: 16px;
					-webkit-mask-image: -webkit-gradient(linear, left -40%, left 80%, from(#fff), to(#ffffff00));
				}
				:global(.avatar) {
					top: -24px;
					left: 16px;
					position: absolute;
				}
				.name {
					z-index: 1;
					margin-left: 88px;
					h1 {
						margin: 0;
					}
					p {
						color: var(--color-secondary);
						margin: 8px 0 0;
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
			.projects .item {
				border-radius: 0;
			}
		}
	}
</style>