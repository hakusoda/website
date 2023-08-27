<script lang="ts">
	import type { Provider } from '@supabase/supabase-js';
	import { Button, TextInput } from '@voxelified/voxeliface';

	import '$lib/styles/auth.scss';
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import KeyFill from '$lib/icons/KeyFill.svelte';
	export let data: PageData;

	let username = '';
	let signingIn = false;
	let signInError: RequestError | null = null;
	const signIn = () => signInError = { error: RequestErrorType.FeatureUnavailable };

	const signInWithOAuth = async (provider: Provider) => {
		signingIn = !(signInError = null);

		const { error } = await data.supabase.auth.signInWithOAuth({
			options: { redirectTo: `${$page.url.origin}/sign-in` },
			provider
		});
		if (error) {
			console.error(error);
			signingIn = !(signInError = { error: RequestErrorType.ExternalRequestError });
		}
	};

	$: {
		const error = $page.url.searchParams.get('error');
		if (error)
			signInError = { error: RequestErrorType.Unknown };
	}
</script>

{#if !data.session && !$page.url.searchParams.get('code')}
	<div class="auth-modal">
		<h2>{$t('signin.social')}</h2>
		<div class="social">
			<button type="button" on:click={() => signInWithOAuth('discord')} disabled={signingIn}>
				<Discord size={24} coloured/>Discord
			</button>
			<button type="button" on:click={() => signInWithOAuth('github')} disabled={signingIn}>
				<GitHub size={24}/>GitHub
			</button>
		</div>

		<h2>{$t('signin.manual')}</h2>
		<div class="manual">
			<TextInput bind:value={username} placeholder={$t('signin.manual.name')}/>
			<Button on:click={signIn} disabled={signingIn || username.length < 3}>
				<KeyFill/>{$t('action.continue')}
			</Button>
		</div>
		<RequestErrorUI data={signInError}/>

		<!--<a href="/sign-up">
			{$t('signin.signup')}
		</a>-->
	</div>
{/if}

<style lang="scss">
	.auth-modal {
		.manual {
			gap: 16px;
			display: flex;
			:global(.text-input) {
				width: 100%;
			}
		}
		/*a {
			color: var(--color-link);
			margin: 32px auto 0;
		}*/
	}
</style>