<script lang="ts">
	import '@voxelified/voxeliface/styles.scss';
	import { Header, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation'; 
	import { theme } from '$lib/settings';
	import type { LayoutData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	import PageLoader from '$lib/components/PageLoader.svelte';

	import CaretDown from '$lib/icons/CaretDown.svelte';
	import Voxelified from '$lib/icons/Voxelified.svelte';
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
</script>

<div class={`app theme-${themeName}`} use:themeHue={themeColour}>
	<Header>
		<a href="/" class="logo"><Voxelified size={40}/></a>
		<a href="/" class="nav-link">{$t('home')}</a>
		{#if data.user}
			<DropdownMenu bind:trigger={userMenuTrigger}>
				<button class="user focusable" type="button" slot="trigger" on:click={userMenuTrigger}>
					<Avatar src={data.user.avatar_url} size="xs" circle/>
					<p class="name">
						{data.user.name ?? data.user.username}
					</p>
					<CaretDown/>
				</button>
				<p>{data.user.name ?? data.user.username}</p>
				<a href={`/user/${data.user.username}`}>{$t('user_action.user.profile')}</a>
				<div class="separator"/>
				<a href="/settings">{$t('user_action.settings.settings')}</a>
				<div class="separator"/>
				<a href="/">{$t('user_action.other.logout')}</a>
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
		:global(.container) {
			margin-left: auto;
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