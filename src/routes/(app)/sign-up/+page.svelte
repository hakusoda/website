<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { getPublicKey } from '$lib/crypto';
	import { invalidateAll } from '$app/navigation';
	import type { ApiRequestError } from '$lib/types';
	import { verifySignUp, getSignUpOptions } from '$lib/api';

	import '$lib/styles/auth.scss';
	import RequestError from '$lib/components/RequestError.svelte';

	import PersonFillAdd from '$lib/icons/PersonFillAdd.svelte';

	let username = '';
	let usernameError: 0 | 1 = 0;
	let typedInitial = false;
	$: if (username.length > 2 && !typedInitial)
		typedInitial = true;
	$: if (typedInitial)
		if (username.length < 3)
			usernameError = 1;
		else
			usernameError = 0;
	$: username = username.slice(0, 20);

	let signingUp = false;
	let signUpError: ApiRequestError | null = null;
	const signUp = async () => {
		signingUp = !(signUpError = null);

		const options = await getSignUpOptions({ username });
		if (!options.success)
			return signingUp = !(signUpError = options);

		const credential = await navigator.credentials.create({
			publicKey: {
				...options.data,
				user: {
					...options.data.user,
					id: Uint8Array.from(options.data.user.id as any as string, c => c.charCodeAt(0))
				},
				challenge: base64.toArrayBuffer(options.data.challenge as any, false)
			}
		}) as PublicKeyCredential;

		const response = await verifySignUp({
			username,
			challenge: options.data.challenge as any,
			transports: (credential.response as any).getTransports(),
			attestation: base64.fromArrayBuffer((credential.response as any).attestationObject),
			device_public_key: await getPublicKey()
		});
		if (!response.success)
			return signingUp = !(signUpError = response);

		invalidateAll();
	};
</script>

<div class="auth-modal">
	<h2>{$t('signup')}</h2>
	<form>
		<TextInput bind:value={username} placeholder={$t('signup.name')}/>
		<Button on:click={signUp} disabled={signingUp || username.length < 3}>
			<PersonFillAdd/>{$t('signup.continue')}
		</Button>
	</form>
	{#if usernameError}
		<p class="name-error">{$t(`signup.name_error.${usernameError}`, [3 - username.length])}</p>
	{/if}
	<RequestError data={signUpError}/>

	<p class="sign-in">
		{$t('signup.signin')}
		<a href="/sign-in">
			{$t('action.sign_in')}
		</a>
	</p>
</div>

<style lang="scss">
	.auth-modal {
		.sign-in {
			color: var(--color-secondary);
			margin: 32px auto 0;
			a {
				color: var(--color-link);
			}
		}
		.name-error {
			color: #dd8282;
			margin: 8px 0 0;
			font-size: .9em;
		}
		:global(.button) {
			white-space: nowrap;
		}
	}
</style>