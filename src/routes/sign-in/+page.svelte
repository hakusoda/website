<script lang="ts">
	import base64 from '@hexagon/base64';
	import { onMount } from 'svelte';
	import { Button, TextInput } from '@voxelified/voxeliface';

	import '$lib/styles/auth.scss';
	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { getPublicKey } from '$lib/crypto';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import type { RequestError } from '$lib/types';
	import { getUserConnectionUrl } from '$lib/util';
	import { USER_CONNECTION_METADATA } from '$lib/constants';
	import { verifySignIn, getSignInOptions } from '$lib/api';
	import { RequestErrorType, UserConnectionType } from '$lib/enums';

	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import KeyFill from '$lib/icons/KeyFill.svelte';
	export let data: PageData;

	let username = '';
	let signingIn = false;
	let signInError: RequestError | null = null;
	const signIn = async () => {
		signingIn = !(signInError = null);

		try {
			const options = await getSignInOptions({ username });
			if (!options.success)
				return signingIn = !(signInError = options);

			const credential = await navigator.credentials.get({
				publicKey: {
					...options.data,
					challenge: base64.toArrayBuffer(options.data.challenge as any),
					allowCredentials: options.data.allowCredentials!.map(item => ({
						...item,
						id: base64.toArrayBuffer(item.id as any)
					}))
				}
			}) as PublicKeyCredential;

			const response = await verifySignIn({
				id: base64.fromArrayBuffer(credential.rawId),
				username,
				auth_data: base64.fromArrayBuffer((credential.response as any).authenticatorData),
				challenge: options.data.challenge as any,
				signature: base64.fromArrayBuffer((credential.response as any).signature),
				client_data: base64.fromArrayBuffer(credential.response.clientDataJSON),
				device_public_key: await getPublicKey()
			});
			if (!response.success)
				return signingIn = !(signInError = response);

			invalidateAll();
		} catch (error) {
			console.error(error);
			signingIn = !(signInError = { error: RequestErrorType.Unknown });
		}	
	};

	$: {
		const error = $page.url?.searchParams.get('error');
		if (error)
			signInError = { error: RequestErrorType.Unknown };
	}

	let publicKey = '';
	onMount(async() => publicKey = `&state=${encodeURIComponent(await getPublicKey())}`);
</script>

{#if !data.session && !$page.url?.searchParams.get('code')}
	<div class="auth-modal">
		<h2>{$t('signin.social')}</h2>
		<div class="social">
			{#each Object.values(UserConnectionType) as type}
				{#if typeof type === 'number'}
					<a href={getUserConnectionUrl(type) + publicKey} style={`--bg: ${USER_CONNECTION_METADATA[type]?.colour};`}>
						<svelte:component this={USER_CONNECTION_METADATA[type]?.icon} size={20}/>
						{$t(`user_connection.type.${type}`)}
					</a>
				{/if}
			{/each}
		</div>

		<h2>{$t('signin.manual')}</h2>
		<form>
			<TextInput bind:value={username} placeholder={$t('signin.manual.name')}/>
			<Button on:click={signIn} disabled={signingIn || username.length < 3}>
				<KeyFill/>{$t('action.continue')}
			</Button>
		</form>
		<RequestErrorUI data={signInError}/>

		<a href="/sign-up">
			{$t('signin.signup')}
		</a>
	</div>
{/if}

<style lang="scss">
	.auth-modal > a {
		color: var(--color-link);
		margin: 32px auto 0;
	}
</style>