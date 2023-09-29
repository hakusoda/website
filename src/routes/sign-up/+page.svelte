<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { invalidateAll } from '$app/navigation';
	import { UserConnectionType } from '$lib/enums';
	import { getUserConnectionUrl } from '$lib/util';
	import type { ApiRequestError } from '$lib/types';
	import { verifySignUp, getSignUpOptions } from '$lib/api';

	import '$lib/styles/auth.scss';
	import RequestError from '$lib/components/RequestError.svelte';

	import Plus from '$lib/icons/Plus.svelte';
	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';

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
			attestation: base64.fromArrayBuffer((credential.response as any).attestationObject)
		});
		if (!response.success)
			return signingUp = !(signUpError = response);

		invalidateAll();
	};
</script>

<div class="auth-modal">
	<h2>{$t('signup.social')}</h2>
	<div class="social">
		<a href={getUserConnectionUrl(UserConnectionType.Discord)}>
			<Discord size={24} coloured/>Discord
		</a>
		<a href={getUserConnectionUrl(UserConnectionType.GitHub)}>
			<GitHub size={24}/>GitHub
		</a>
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