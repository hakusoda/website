<script lang="ts">
	import base64 from '@hexagon/base64';
	import { onMount } from 'svelte';
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { getPublicKey } from '$lib/crypto';
	import { invalidateAll } from '$app/navigation';
	import { UserConnectionType } from '$lib/enums';
	import { getUserConnectionUrl } from '$lib/util';
	import type { ApiRequestError } from '$lib/types';
	import { USER_CONNECTION_METADATA } from '$lib/constants';
	import { verifySignUp, getSignUpOptions } from '$lib/api';

	import '$lib/styles/auth.scss';
	import RequestError from '$lib/components/RequestError.svelte';

	import Plus from '$lib/icons/Plus.svelte';

	let username = '';
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

	let publicKey = '';
	onMount(async() => publicKey = `&state=${encodeURIComponent(await getPublicKey())}`);
</script>

<div class="auth-modal">
	<h2>{$t('signup.social')}</h2>
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

	<h2>{$t('signup.manual')}</h2>
	<form>
		<TextInput bind:value={username} placeholder={$t('signup.manual.name')}/>
		<Button on:click={signUp} disabled={signingUp || username.length < 3}>
			<Plus/>{$t('action.continue')}
		</Button>
	</form>
	<RequestError data={signUpError}/>

	<p>
		{$t('signup.signin')}
		<a href="/sign-in">
			{$t('action.sign_in')}
		</a>
	</p>
</div>

<style lang="scss">
	.auth-modal {
		p {
			color: var(--color-secondary);
			margin: 32px auto 0;
			a {
				color: var(--color-link);
			}
		}
	}
</style>