<script lang="ts">
	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { getUser } from '$lib/api';
	import type { PageData } from './$types';

	import GitHub from '$lib/icons/GitHub.svelte';
	export let data: PageData;
	const redirect = async () => {
		await data.supabase.auth.signInWithOAuth({
			options: { redirectTo: `${data.url}/login` },
			provider: 'github'
		});
	};

	$: if (data.session) {
		getUser(data.session.user.id).then(user => {
			if (user)
				goto(`/user/${user.username}`);
			else
				goto('/login/profile');
		});
	}
</script>

<div class="main">
	<h1>{$t('signup')}</h1>
	{#if !data.session}
		<div class="btn-container">
			<button class="login-btn" on:click={redirect}><GitHub size={20}/>{$t('login.github')}</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.main {
		margin: 4rem auto;
		h1 {
			font-size: 2.5em;
		}
		.btn-container {
			display: flex;
			margin-top: 32px;
			justify-content: center;
			.login-btn {
				gap: 12px;
				color: var(--button-color);
				border: none;
				cursor: pointer;
				display: flex;
				padding: 12px 24px;
				font-size: 1em;
				text-align: center;
				transition: background .25s;
				box-shadow: var(--button-shadow);
				background: var(--button-background);
				font-weight: 500;
				user-select: none;
				font-family: var(--font-tertiary);
				border-radius: 4px;
				text-decoration: none;
				&:hover {
					background: var(--button-background-hover);
				}
			}
		}
	}
</style>