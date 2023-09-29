<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import { inject } from '@vercel/analytics';
	import MediaQuery from 'svelte-media-queries';
	import { DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation'; 
	import { page } from '$app/stores';
	import { theme } from '$lib/settings';
	import { sudoModal } from '$lib/store';
	import { webVitals } from '$lib/vitals';
	import { dev, browser } from '$app/environment';
	import { invalidateAll } from '$app/navigation';
	import type { LayoutData } from './$types';
	import { UserNotificationState } from '$lib/enums';
	import { getUserNotificationUrl } from '$lib/util';
	import { markNotificationAsRead, clearAllNotifications, markAllNotificationsAsRead } from '$lib/api';
	inject({ mode: dev ? 'development' : 'production' });

	import Avatar from '$lib/components/Avatar.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import EnableSudo from '$lib/modals/EnableSudo.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';

	import X from '$lib/icons/X.svelte';
	import Eye from '$lib/icons/Eye.svelte';
	import Bell from '$lib/icons/Bell.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	import BoxArrowInRight from '$lib/icons/BoxArrowInRight.svelte';
	import VoxelifiedBanner from '$lib/icons/VoxelifiedBanner.svelte';
	$: [themeName, themeColour] = $theme.split('_');
	const themeHues: Record<string, number> = {
		purple: 280
	};

	function themeHue(node: HTMLDivElement, color: string) {
		node.style.setProperty('--theme-hue', themeHues[color]?.toString());
		return {
			update: (color: string) =>
				node.style.setProperty('--theme-hue', themeHues[color]?.toString())
		}
	}

	export let data: LayoutData;

	let userMenuTrigger: () => void;
	let notificationsTrigger: () => void;

	const { analyticsId } = data;
	$: if (browser && analyticsId)
		webVitals({
			path: $page.url.pathname,
			params: $page.params,
			analyticsId
		});

	const signout = () => {
		document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; domain=.voxelified.com; path=/; Secure';

		// incase that doesn't work...
		(window as any).cookieStore?.delete?.({ path: '/', name: 'auth-token' });
		invalidateAll();
	};

	$: unreadNotifications = data.notifications.filter(item => item.state === UserNotificationState.Unread);
	let clearingNotifications = false;
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<header>
		<a href="/" class="logo">
			<MediaQuery query="(min-width: 512px)" let:matches>
				{#if matches}
					<VoxelifiedBanner/>
				{:else}
					<Voxelified size={40}/>
				{/if}
			</MediaQuery>
		</a>
		<a href="/" class="nav-link">{$t('home')}</a>
		{#if data.session && data.user}
			<DropdownMenu.Root bind:trigger={notificationsTrigger}>
				<button class="notifications focusable" class:unread={data.notifications.some(item => item.state === UserNotificationState.Unread)} type="button" slot="trigger" on:click={notificationsTrigger}>
					<Bell/>
					{#if unreadNotifications.length}
						{unreadNotifications.length}
					{/if}
				</button>
				<p>{$t('notifications', [data.notifications.length, unreadNotifications.length])}</p>
				{#if data.notifications.length}
					<div class="notifications-container">
						{#each data.notifications as item}
							<a href={getUserNotificationUrl(item)} class="notification" on:click={() => {
								item.state = UserNotificationState.Read;
								if (data.session) // https://github.com/sveltejs/svelte/issues/6778
									markNotificationAsRead(data.session.sub, item.id);
							}}>
								<Avatar src={item.target_team?.avatar_url ?? item.target_user?.avatar_url} size="sm"/>
								{#if item.target_user && item.target_team}
									<Avatar src={item.target_user.avatar_url} size="xxs" circle transparent/>
								{/if}
								<div class="details">
									<p class="time">
										{$t(`user_notification.type.${item.type}`)} • {$t('time_ago', [item.created_at])}
									</p>
									<h1>{$t(`user_notification.type.${item.type}.summary`, [item, item.target_user?.name ?? `@${item.target_user?.username}`])}</h1>
									<p class="time">
										{$t(`user_notification.type.${item.type}.footer`, [item, item.target_user?.name ?? `@${item.target_user?.username}`])}
									</p>
								</div>
								{#if !item.state}
									<div class="unread"/>
								{/if}
							</a>
						{/each}
					</div>
					<button type="button" class="mark-read" disabled={clearingNotifications} on:click|stopPropagation={() => {
						clearingNotifications = true;
						if (data.session) // https://github.com/sveltejs/svelte/issues/6778
							markAllNotificationsAsRead(data.session.sub).then(() => location.reload())
					}}>
						{#if clearingNotifications}<Loader size={16}/>{:else}<Eye/>{/if}
						{$t('notifications.read_all')}
					</button>
					<button type="button" class="mark-read" disabled={clearingNotifications} on:click|stopPropagation={() => {
						clearingNotifications = true;
						if (data.session) // https://github.com/sveltejs/svelte/issues/6778
							clearAllNotifications(data.session.sub).then(() => location.reload())
					}}>
						{#if clearingNotifications}<Loader size={16}/>{:else}<X/>{/if}
						{$t('notifications.clear')}
					</button>
				{:else}
					<p class="notifications-empty">{$t('notifications.empty')}</p>
				{/if}
			</DropdownMenu.Root>
			<DropdownMenu.Root bind:trigger={userMenuTrigger}>
				<button class="user" type="button" slot="trigger" on:click={userMenuTrigger}>
					<Avatar id={data.user.id} src={data.user.avatar_url} size="xs40" circle/>
				</button>
				<p>{data.user.name ?? data.user.username}</p>
				<a href={`/user/${data.user.username}`}>
					<PersonFill/>{$t('user_action.user.profile')}
				</a>
				<a href="/settings/access/teams">
					<PeopleFill/>{$t('user_action.user.teams')}
				</a>
				<div class="separator"/>
				<a href="/settings/account">
					<GearFill/>{$t('user_action.settings')}
				</a>
				<div class="separator"/>
				<button type="button" on:click={signout}>
					<BoxArrowRight/>{$t('user_action.other.logout')}
				</button>
			</DropdownMenu.Root>
		{:else if !data.session}
			<a href="/sign-in" class="nav-link signin">
				<BoxArrowInRight/>{$t('action.sign_in')}
			</a>
		{/if}
	</header>
	<main class="app-content">
		<slot/>
		<footer>
			<div class="header">
				<p class="name">
					<VoxelifiedBanner/>
				</p>
				<p class="oss">
					{$t('footer.oss')}
					<a href="https://github.com/voxelified">{$t('footer.oss.link')}</a>.
				</p>
			</div>
			<div class="links">
				<p>{$t('footer.resources')}</p>
				<a href="https://status.voxelified.com" target="_blank">Status</a>
				<a href="https://github.com/voxelified" target="_blank">GitHub</a>
			</div>
			<div class="links">
				<p>{$t('footer.community')}</p>
				<a href="https://discord.com/invite/rs3r4dQu9P" target="_blank">Discord</a>
			</div>
		</footer>
		<PageLoader/>
		{#if $sudoModal}
			<EnableSudo/>
		{/if}
	</main>
</div>

<svelte:head>
	<meta property="og:type" content="website">
	<meta name="theme-color" content="#cc6699">
	<meta name="og:site_name" content="Voxelified">
</svelte:head>

<style lang="scss">
	.app {
		height: 100vh;
		display: flex;
		overflow: auto;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;
		.app-content {
			height: 100%;
			display: flex;
			background: center url(/img/background.svg);
			padding-top: 48px;
			flex-direction: column;
		}

		--color-link: hsl(330 90% 80%);
		--color-verified: color-mix(in srgb, var(--button-background) 75%, #fff);
	}
	:global(body) {
		overflow: hidden auto;
	}

	header {
		width: -webkit-fill-available;
		z-index: 100;
		display: flex;
		padding: 8px 32px;
		position: absolute;
		background: color-mix(in srgb, transparent, var(--background-primary) 75%);
		align-items: center;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		@media (max-width: 512px) {
			padding: 8px 16px;
		}
		:global(.container:first-of-type) {
			margin: 0 32px 0 auto;
		}
	}
	.logo {
		display: flex;
		margin-right: 24px;
	}
	.nav-link {
		color: var(--color-primary);
		margin: auto 16px;
		font-size: 14px;
		font-weight: 500;
		text-decoration: none;
		&.signin {
			gap: 10px;
			color: #fff;
			display: flex;
			padding: 8px 16px;
			font-size: .8em;
			box-shadow: inset 0 0 0 1px #fff;
			transition: box-shadow .5s, background .5s;
			margin-left: auto;
			align-items: center;
			border-radius: 16px;
			&:hover {
				background: #ffffff0d;
				box-shadow: inset 0 0 0 1px #ffffff80;
			}
		}
	}
	.notifications {
		gap: 8px;
		color: var(--color-secondary);
		height: 32px;
		border: none;
		cursor: pointer;
		display: flex;
		padding: 0 12px;
		background: none;
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 16px;
		&:hover {
			color: var(--color-primary);
		}
		&.unread {
			color: var(--button-color);
			background: var(--button-background);
		}
	}
	.notifications-container {
		overflow: auto;
		max-height: 256px;
	}
	.notification {
		gap: 16px;
		height: 64px;
		padding: 0 16px 0 8px;
		position: relative;
		transition: .5s opacity, .5s box-shadow, .5s background;
		:global(.avatar):not(:first-child) {
			top: 36px;
			left: 36px;
			position: absolute;
		}
		.details {
			margin-right: 32px;
			.time {
				color: var(--color-secondary);
				margin: 0;
				padding: 0;
				font-size: 12px;
				line-height: unset;
			}
			h1 {
				margin: 4px 0 2px;
				font-size: 14px;
				font-weight: 400;
				white-space: nowrap;
			}
		}
		.unread {
			width: 8px;
			height: 8px;
			background: var(--button-background);
			box-shadow: 0 0 8px 4px var(--button-background);
			margin-left: auto;
			border-radius: 50%;
		}
		&:hover {
			background: var(--background-tertiary);
		}
		&:not(:has(.unread)) {
			opacity: 0.5;
			&:hover {
				opacity: 1;
			}
		}
	}
	.notifications-empty {
		color: var(--color-tertiary);
		font-size: 1.1em;
		white-space: pre;
	}
	.user {
		border: none;
		cursor: pointer;
		display: flex;
		background: none;
		.name {
			margin: 0 24px 0 16px;
			font-size: 1.1em;
			font-weight: 600;
		}
	}
	@media (max-width: 512px) {
		.user .name {
			display: none;
		}
		.user :global(svg) {
			margin-left: 16px;
		}
	}
	
	:global(a) {
		color: var(--color-primary);
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	footer {
		color: var(--color-secondary);
		display: flex;
		padding: 40px 64px;
		flex-wrap: wrap;
		margin-top: auto;
		background: var(--background-primary);
		border-top: 1px solid var(--border-primary);
		.header {
			.name {
				gap: 8px;
				margin: 0;
				display: flex;
				font-size: 1.25em;
				font-weight: 500;
				align-items: center;
			}
			.oss {
				font-size: .9em;
				margin-top: 8px;
			}
		}
		.links {
			gap: 4px;
			margin: 8px 0 0 96px;
			display: flex;
			flex-direction: column;
			p {
				margin: 0;
				font-size: .8em;
			}
			a {
				font-size: .9em;
			}
		}
	}

	:global(.menu-content) {
		min-width: 256px;
	}
</style>