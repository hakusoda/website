<script lang="ts">
	import './AppLayout.scss';
	import { DropdownMenu } from '@hakumi/essence';
	import type { SvelteComponent } from 'svelte';

	import { t } from '$lib/localisation'; 
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { UserNotificationState } from '$lib/enums';
	import { getUserNotificationUrl } from '$lib/util';
	import type { User, UserSessionJWT, UserNotification } from '$lib/types';
	import { markNotificationAsRead, clearAllNotifications, markAllNotificationsAsRead } from '$lib/api';

	import Avatar from '$lib/components/Avatar.svelte';
	import Loader from '$lib/components/Loader.svelte';

	import X from '$lib/icons/X.svelte';
	import Eye from '$lib/icons/Eye.svelte';
	import Bell from '$lib/icons/Bell.svelte';
	import GearFill from '$lib/icons/GearFill.svelte';
	import BrandLogo from '$lib/icons/BrandLogo.svelte';
	import PeopleFill from '$lib/icons/PeopleFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	import BoxArrowInRight from '$lib/icons/BoxArrowInRight.svelte';
	export let user: User | null;
	export let session: UserSessionJWT | null;
	export let navigation: [string, typeof SvelteComponent<any>, string?][] = [];
	export let notifications: UserNotification[];

	let userMenuTrigger: () => void;
	let notificationsTrigger: () => void;

	const signout = () => {
		document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; domain=.hakumi.cafe; path=/; Secure';

		// incase that doesn't work...
		(window as any).cookieStore?.delete?.({ path: '/', name: 'auth-token' });
		invalidateAll();
	};

	$: unreadNotifications = notifications.filter(item => item.state === UserNotificationState.Unread);
	let clearingNotifications = false;
</script>

<div class="app-container">
	<header>
		<div class="geist">
			<div class="head">
				<a href="/" class="logo">
					<BrandLogo size={32}/>
				</a>
				<div class="navigation">
					<a href="/" class="nav-link" class:active={$page.url.pathname === '/'}>{$t('home')}</a>
				</div>
				{#if session && user}
					<DropdownMenu.Root bind:trigger={notificationsTrigger}>
						<button class="notifications focusable" class:unread={notifications.some(item => item.state === UserNotificationState.Unread)} type="button" slot="trigger" on:click={notificationsTrigger}>
							<Bell/>
							{#if unreadNotifications.length}
								{unreadNotifications.length}
							{/if}
						</button>
						<p>{$t('notifications', [notifications.length, unreadNotifications.length])}</p>
						{#if notifications.length}
							<div class="notifications-container">
								{#each notifications as item}
									<a href={getUserNotificationUrl(item)} class="notification" on:click={() => {
										item.state = UserNotificationState.Read;
										if (session) // https://github.com/sveltejs/svelte/issues/6778
											markNotificationAsRead(session.sub, item.id);
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
								if (session) // https://github.com/sveltejs/svelte/issues/6778
									markAllNotificationsAsRead(session.sub).then(() => location.reload())
							}}>
								{#if clearingNotifications}<Loader size={16}/>{:else}<Eye/>{/if}
								{$t('notifications.read_all')}
							</button>
							<button type="button" class="mark-read" disabled={clearingNotifications} on:click|stopPropagation={() => {
								clearingNotifications = true;
								if (session) // https://github.com/sveltejs/svelte/issues/6778
									clearAllNotifications(session.sub).then(() => location.reload())
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
							<Avatar id={user.id} src={user.avatar_url} size="xs" circle/>
						</button>
						<p>{user.name ?? user.username}</p>
						<a href={`/user/${user.username}`}>
							<PersonFill/>{$t('user_action.user.profile')}
						</a>
						<a href="/settings/teams">
							<PeopleFill/>{$t('user_action.user.teams')}
						</a>
						<div class="separator"/>
						<a href="/settings/profile">
							<GearFill/>{$t('user_action.settings')}
						</a>
						<div class="separator"/>
						<button type="button" on:click={signout}>
							<BoxArrowRight/>{$t('user_action.other.logout')}
						</button>
					</DropdownMenu.Root>
				{:else if !session}
					<a href="/sign-in" class="sign-in">
						<BoxArrowInRight/>{$t('action.sign_in')}
					</a>
				{/if}
			</div>
			{#if navigation.length}
				<div class="navigation">
					{#each navigation as [href, icon, tkey]}
						<a {href} class:active={$page.url.pathname.startsWith(href)}>
							<svelte:component this={icon}/>
							{$t(tkey ?? `navigation${href.replace(/\//g, '.')}`)}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</header>
	<main>
		<slot/>
	</main>
</div>
<footer>
	<div class="header">
		<p class="name">
			<BrandLogo/>
		</p>
		<p class="oss">
			{$t('footer.oss')}
			<a href="https://github.com/hakusoda">{$t('footer.oss.link')}</a>.
		</p>
	</div>
	<div class="links">
		<p>{$t('footer.legal')}</p>
		<a href="/terms">{$t('footer.legal.terms')}</a>
		<a href="/privacy">{$t('footer.legal.privacy')}</a>
	</div>
	<div class="links">
		<p>{$t('footer.resources')}</p>
		<a href="https://status.hakumi.cafe" target="_blank">Status</a>
		<a href="https://github.com/hakusoda" target="_blank">GitHub</a>
	</div>
	<div class="links">
		<p>{$t('footer.community')}</p>
		<a href="https://discord.com/invite/rs3r4dQu9P" target="_blank">Discord</a>
		<a href="https://x.com/@voxelified" target="_blank">X</a>
	</div>
</footer>

<style lang="scss">
	.app-container {
		min-height: 100vh;
	}
	header {
		top: -56px;
		z-index: 100;
		position: sticky;
		background: var(--background-primary);
		border-bottom: 1px solid var(--border-primary);
		.geist {
			padding: 16px 32px;
			max-width: calc(100vw - 64px);
		}
		.logo {
			display: flex;
		}
		.head {
			gap: 16px;
			color: var(--color-primary);
			display: flex;
			align-items: center;
			.navigation {
				margin: 0 auto 0 24px;
				a {
					font-size: 14px;
					&.active, &:hover {
						color: #fff;
						font-weight: 500;
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
				padding: 0;
				display: flex;
				background: none;
			}
			@media (max-width: 512px) {
				.user :global(svg) {
					margin-left: 16px;
				}
			}
			.sign-in {
				gap: 10px;
				margin: 0 0 0 auto;
				display: flex;
				padding: 6px 14px;
				font-size: .8em;
				transition: box-shadow .5s;
				box-shadow: inset 0 0 0 1px var(--border-secondary);
				align-items: center;
				border-radius: 12px;
				&:hover {
					box-shadow: inset 0 0 0 1px #ffffff80;
					text-decoration: none;
				}
			}
		}
		.navigation {
			gap: 32px;
			display: flex;
			margin-top: 24px;
			a {
				gap: 12px;
				color: hsl(250 20% 90% / 80%);
				display: flex;
				font-size: 13px;
				transition: color .1s;
				align-items: center;
				&.active, &:hover {
					color: var(--menu-color-hover);
					text-decoration: none;
				}
			}
		}
	}

	main {
		width: 100%;
		background: center url(/img/background.svg);
	}

	footer {
		color: var(--color-secondary);
		display: flex;
		flex-wrap: wrap;
		margin-top: auto;
		min-height: 192px;
		border-top: 1px solid var(--border-primary);
		align-items: center;
		justify-content: center;
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
</style>