<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button } from '@hakumi/essence';
	import { onMount } from 'svelte';

	import { t } from '$lib/ui/localisation/index';
	import { goto } from '$app/navigation';
	import { get_auth_public_key } from '$lib/client/crypto';
	import { verifyNewDevice, getNewDeviceOptions } from '$lib/client/api';

	import Loader from '$lib/ui/components/Loader.svelte';

	import ArrowClockwise from 'virtual:icons/bi/arrow-clockwise';
	export let data;

	let error = '';
	const create = async () => {
		error = '';
		
		const options = await getNewDeviceOptions();
		if (!options.success)
			return error = options.error;

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
			name: 'Default Sign-in Passkey',
			challenge: options.data.challenge as any,
			transports: (credential.response as any).getTransports(),
			attestation: base64.fromArrayBuffer((credential.response as any).attestationObject),
			device_public_key: await get_auth_public_key()
		});
		if (!response.success)
			return error = response.error;

		const state = data.session!.mellow_user_state!;
		goto(`/mellow/server/${state.split('_')[1]}${state.startsWith('sync_') ? '/onboarding' : ''}`, { invalidateAll: true });
	};
	onMount(create);
</script>

<div class="mellow-signup">
	{#if error}
		<p>{$t(`request_error.${error}`)}</p>
		<Button on:click={create}>
			<ArrowClockwise/>{$t('action.try_again')}
		</Button>
	{:else}
		<Loader/>
	{/if}
</div>

<style lang="scss">
	.mellow-signup {
		height: 100%;
		display: flex;
		align-items: center;
		flex-direction: column;
		justify-content: center;
	}
</style>