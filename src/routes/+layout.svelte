<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import { inject } from '@vercel/analytics';
	import { Header, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation'; 
	import { page } from '$app/stores';
	import { theme } from '$lib/settings';
	import { webVitals } from '$lib/vitals';
	import { dev, browser } from '$app/environment';
	import type { LayoutData } from './$types';
	import { UserNotificationState } from '$lib/enums';
	import { markNotificationAsRead } from '$lib/api';
	import { getUserNotificationUrl } from '$lib/util';
	inject({ mode: dev ? 'development' : 'production' });

	import Avatar from '$lib/components/Avatar.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';

	import Bell from '$lib/icons/Bell.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import CaretDown from '$lib/icons/CaretDown.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
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

	const signout = () => data.supabase.auth.signOut().then(async () => {
		await (window as any).cookieStore?.getAll?.().then(async (cookies: any[]) => {
			for (const item of cookies)
				if (item.name.includes('auth-token'))
					await (window as any).cookieStore.delete(item.name);
		}).catch(console.error);
		location.href = '/';
	});

	$: unreadNotifications = data.notifications.filter(item => item.state === UserNotificationState.Unread);
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<Header>
		<a href="/" class="logo"><Voxelified size={40}/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		{#if data.session && data.user}
			<DropdownMenu bind:trigger={notificationsTrigger}>
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
								if (data.session && data.user) // can't use typescript here :(
									markNotificationAsRead(data.session.access_token, data.user.id, item.id);
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
										{$t(`user_notification.type.${item.type}.footer`, [item])}
									</p>
								</div>
								{#if !item.state}
									<div class="unread"/>
								{/if}
							</a>
						{/each}
					</div>
					<button type="button" class="mark-read">
						{$t('notifications.read_all')}
					</button>
				{:else}
					<p class="notifications-empty">{$t('notifications.empty')}</p>
				{/if}
			</DropdownMenu>
			<DropdownMenu bind:trigger={userMenuTrigger}>
				<button class="user focusable" type="button" slot="trigger" on:click={userMenuTrigger}>
					<Avatar src={data.user.avatar_url} size="xs" circle/>
					<p class="name">{data.user.name ?? data.user.username}</p>
					<CaretDown/>
				</button>
				<p>{data.user.name ?? data.user.username}</p>
				<a href={`/user/${data.user.username}`}>
					<PersonFill/>{$t('user_action.user.profile')}
				</a>
				<div class="separator"/>
				<a href="/settings/account">
					<GearFill/>{$t('user_action.settings')}
				</a>
				<div class="separator"/>
				<button type="button" on:click={signout}>
					<BoxArrowRight/>{$t('user_action.other.logout')}
				</button>
			</DropdownMenu>
		{:else if !data.session}
			<a href="/login" class="nav-link signup">{$t('action.create_account')}</a>
		{/if}
	</Header>
	<main class="app-content">
		<slot/>
		<footer>
			voxel voxel voxel ified ified ified
			<a href="/">placeholder</a>
		</footer>
	</main>
</div>

<PageLoader/>

<svelte:head>
	<meta property="og:type" content="website">
	<meta name="theme-color" content="#cc6699">
	<meta name="og:site_name" content="Voxelified">
</svelte:head>

<style lang="scss">
	.app {
		height: 100vh;
		display: flex;
		min-height: 100vh;
		background: var(--background-primary);
		flex-direction: column;
		.app-content {
			height: 100%;
			display: flex;
			overflow: auto;
			flex-direction: column;
		}

		--color-link: hsl(330 90% 80%);
		--button-color: hsl(330 100% 98%);
		--button-color-active: hsl(330 100% 88%);
		--button-background: hsl(330 50% 60%);
		--button-background-hover: hsl(330 50% 55%);
		--button-background-active: hsl(330 50% 50%);
	}
	:global(body) {
		overflow: hidden auto;
	}

	:global(header) {
		display: flex;
		align-items: center;
		:global(.container:first-of-type) {
			margin: 0 32px 0 auto;
		}
	}
	.logo {
		display: flex;
		margin-right: 12px;
	}
	.nav-link {
		color: var(--color-primary);
		margin: auto 12px;
		font-size: .95em;
		text-decoration: none;
		&.signup {
			margin-left: auto;
		}
	}
	.notifications {
		gap: 8px;
		color: var(--color-secondary);
		border: none;
		cursor: pointer;
		padding: 8px;
		display: flex;
		background: none;
		font-family: var(--font-primary);
		border-radius: 8px;
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
		transition: .25s opacity, .25s box-shadow, .25s background;
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
				line-height: unset;
			}
			h1 {
				margin: 4px 0 2px;
				font-size: 1.2em;
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
			background: var(--background-secondary);
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
	.mark-read {
		padding: 0 12px;
		margin-top: 8px;
		box-shadow: var(--button-shadow);
		background: var(--background-secondary);
	}
	.user {
		color: var(--color-secondary);
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		display: flex;
		background: none;
		text-align: start;
		align-items: center;
		font-family: var(--font-primary);
		border-radius: 8px;
		.name {
			margin: 0 24px 0 16px;
			font-size: 1.1em;
			font-weight: 600;
		}
		&:hover {
			background: #ffffff40;
		}
	}
	
	:global(a) {
		color: var(--color-primary);
		text-decoration: none;

		&:hover { text-decoration: underline; }
	}

	footer {
		gap: 4px;
		color: var(--color-secondary);
		display: flex;
		padding: 40px 24px;
		margin-top: auto;
		background: var(--background-header);
		flex-direction: column;
		justify-content: center;
		a {
			color: var(--color-tertiary);
			text-decoration: none;
		}
	}
</style>