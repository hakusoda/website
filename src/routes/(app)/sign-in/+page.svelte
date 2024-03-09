<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button, TextInput } from '@hakumi/essence';

	import '$lib/ui/styles/auth.scss';
	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { get_auth_public_key } from '$lib/client/crypto';
	import { invalidateAll } from '$app/navigation';
	import { RequestErrorType } from '$lib/shared/enums';
	import type { RequestError } from '$lib/shared/types';
	import { verifySignIn, getSignInOptions } from '$lib/client/api';

	import RequestErrorUI from '$lib/ui/components/RequestError.svelte';

	import KeyFill from 'virtual:icons/bi/key-fill';
	export let data;

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
				device_public_key: await get_auth_public_key()
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
</script>

{#if !data.session && !$page.url?.searchParams.get('code')}
	<div class="auth-modal">
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