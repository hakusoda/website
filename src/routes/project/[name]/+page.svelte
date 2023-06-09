<script lang="ts">
	import { Button } from '@voxelified/voxeliface';
	import type { PageData } from './$types';

	import { t } from '$lib/localisation';
	import Avatar from '$lib/components/Avatar.svelte';

	import Star from '$lib/icons/Star.svelte';
	import GitHub from '$lib/icons/GitHub.svelte';
	import Sunrise from '$lib/icons/Sunrise.svelte';
	import BoxArrowUpRight from '$lib/icons/BoxArrowUpRight.svelte';
	export let data: PageData;
</script>

<div class="main">
	<div class="header">
		<img src={data.banner_url} alt="banner" class="banner"/>
		<div class="details">
			<Avatar src={data.avatar_url} size="md" transparent/>
			<div class="title">
				<div class="name">
					<h1>{data.display_name}</h1>
					<p class="author">
						{$t('project.author.0')}<a href={`/team/${data.creator.name}`}>{data.creator.display_name}</a>{$t('project.author.1', [data.contributors.length + data.external_contributors])}
					</p>
				</div>
				<p>{data.summary}</p>
			</div>
			<div class="buttons">
				{#if data.website_url}
					<Button href={data.website_url} target="_blank">
						<BoxArrowUpRight/>{$t('project.website')}
					</Button>
				{/if}
				{#if data.github_url}
					<Button href={data.github_url} target="_blank">
						<GitHub/>{$t('project.github')}
					</Button>
				{/if}
			</div>
		</div>
	</div>
	<div class="info-card about">
		<h1>{$t('project.about')}</h1>
		<p>{data.bio ?? $t('project.about.empty')}</p>
	</div>
	<div class="info-card contributors">
		<h1>{$t('project.contributors')}</h1>
		<div class="items">
			<a class="item" href={`/team/${data.creator.name}`}>
				<Avatar src={data.creator.avatar_url} size="sm" transparent/>
				<div class="name">
					<h1>{data.creator.display_name}</h1>
					<p>{$t('members', [data.creator.members.length])}</p>
				</div>
			</a>
			{#each data.contributors as item}
				<a class="item" href={`/user/${item.username}`}>
					<Avatar src={item.avatar_url} size="sm" circle/>
					<div class="name">
						<h1>{item.name ?? item.username}</h1>
						<p>@{item.username}</p>
					</div>
				</a>
			{/each}
		</div>
		{#if data.external_contributors}
			<p class="other">{$t('project.contributors.external', [data.external_contributors])}</p>
		{/if}
	</div>
	<div class="info-card extra">
		<p><Sunrise/>{$t('team.joined', [data.created_at])}</p>
		<p><Star/>{$t('project.id', [data.id])}</p>
	</div>
</div>

<svelte:head>
	<title>{data.display_name}</title>
	<meta content={data.display_name} property="og:title">
	<meta content={data.summary} property="og:description">
	<meta content={data.avatar_url} property="og:image">
	<meta name="og:type" content="profile">
	<meta property="profile:username" content={data.name}>
</svelte:head>

<style lang="scss">
	.main {
		margin: 32px;
		.header {
			overflow: hidden;
			background: var(--background-secondary);
			border-radius: 16px;
			.banner {
				width: 100%;
				mask-image: linear-gradient(to bottom, #fff 60%, #ffffff00);
				aspect-ratio: 16 / 3;
				-webkit-mask-image: -webkit-gradient(linear, left 60%, left bottom, from(#fff), to(#ffffff00));
			}
			.details {
				gap: 24px 0;
				display: flex;
				padding: 20px 0 24px 176px;
				position: relative;
				flex-wrap: wrap;
				:global(.avatar) {
					top: -32px;
					left: 48px;
					filter: drop-shadow(0 16px 8px #00000040);
					position: absolute
				}
				.title {
					.name {
						display: flex;
						align-items: end;
						h1 {
							margin: 0;
						}
						.author {
							color: var(--color-secondary);
							margin: 0 0 4px 8px;
							font-size: .9em;
						}
					}
					p {
						color: var(--color-secondary);
						margin: 8px 0 0;
						font-size: .9em;
					}
				}
				.buttons {
					gap: 16px;
					margin: auto 32px auto auto;
					display: flex;
				}
			}
		}
		.info-card {
			padding: 24px;
			margin-top: 32px;
			background: var(--background-secondary);
			border-radius: 16px;
			h1 {
				margin: 0;
				font-size: 1.5em;
				font-weight: 600;
			}
		}
		.about {
			p {
				color: var(--color-tertiary);
				margin: 16px 0 0;
			}
		}
		.contributors {
			.items {
				gap: 16px;
				display: flex;
				flex-wrap: wrap;
				margin-top: 16px;
				.item {
					display: flex;
					padding: 8px 24px 8px 8px;
					background: var(--background-tertiary);
					align-items: center;
					border-radius: 8px;
					text-decoration: none;
					.name {
						margin-left: 16px;
						h1 {
							margin: 0;
							font-size: 1.2em;
						}
						p {
							color: var(--color-secondary);
							margin: 2px 0 0;
							font-size: .8em;
						}
					}
				}
			}
			.other {
				color: var(--color-secondary);
				margin: 16px 0 0;
				font-size: .9em;
			}
		}
		.extra {
			gap: 12px;
			display: flex;
			flex-direction: column;
			p {
				gap: 8px;
				color: var(--color-tertiary);
				margin: 0;
				display: flex;
			}
		}
	}
	@media (max-width: 512px) {
		.main {
			margin: 0;
			.header, .info-card {
				border-radius: 0;
			}
			.contributors .item {
				flex: 1 1 calc(50% - 48px);
			}
			.author {
				display: none;
			}
		}
	}
</style>