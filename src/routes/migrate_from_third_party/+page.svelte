<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { getPublicKey } from '$lib/crypto';
	import { verifyNewDevice, getNewDeviceOptions } from '$lib/api';

	import Plus from '$lib/icons/Plus.svelte';
	import BoxArrowRight from '$lib/icons/BoxArrowRight.svelte';
	export let data;

	$: connection = data.session!.source_connection_type;

	let disabled = false;
	const signOut = () => {
		disabled = true;

		document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=None; domain=.hakumi.cafe; path=/; Secure';
		(window as any).cookieStore?.delete?.({ path: '/', name: 'auth-token' });

		goto('/sign-in', { invalidateAll: true });
	};

	const createDevice = async () => {
		disabled = true;

		const options = await getNewDeviceOptions();
		if (!options.success)
			return disabled = false;

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

		const response = await verifyNewDevice({
			name: 'Security Migration Passkey',
			challenge: options.data.challenge as any,
			transports: (credential.response as any).getTransports(),
			attestation: base64.fromArrayBuffer((credential.response as any).attestationObject),
			device_public_key: await getPublicKey()
		});

		if (response.success)
			goto(`/user/${data.session!.sub}`, { invalidateAll: true });
		else
		disabled = false;
	};
</script>

<div class="this-is-not-minecraft-account-migration-can-you-believe-it">
	<h1>Security Update</h1>
	<p>
		Due to a recent account security update, third-party initiated sessions are no longer available.<br/>
		<i>(you are currently signed-in with {connection !== undefined ? $t(`user_connection.type.${connection}`) : 'Discord, GitHub, or Roblox'})</i>
	</p>

	<br/>
	{#if data.has_passkey}
		<p>You will need to sign-out, and then sign-in with one of your passkeys.</p>
		<Button on:click={signOut} {disabled}>
			<BoxArrowRight/>{$t('action.continue')}
		</Button>
	{:else}
		<p>Simply create a new Passkey, and you'll be on your merry way!</p>
		<Button on:click={createDevice} {disabled}>
			<Plus/>{$t('action.create')}
		</Button>
	{/if}
</div>

<style lang="scss">
	.this-is-not-minecraft-account-migration-can-you-believe-it {
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
	}
	p {
		text-align: center;
	}
</style>