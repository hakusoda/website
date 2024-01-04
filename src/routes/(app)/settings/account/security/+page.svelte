<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button, TextInput, ContextMenu } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';
	import type { ApiRequestError } from '$lib/types';
	import { verifyNewDevice, getNewDeviceOptions } from '$lib/api';

	import RequestError from '$lib/components/RequestError.svelte';
	import SecurityDevice from '$lib/components/SecurityDevice.svelte';

	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;

	let trigger: () => void;

	let error: ApiRequestError | null = null;
	let addingKey = false;
	let securityKeyName = '';
	const addDevice = async () => {
		addingKey = !(error = null);

		const options = await getNewDeviceOptions();
		if (!options.success)
			return addingKey = !(error = options);

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
			name: securityKeyName,
			challenge: options.data.challenge as any,
			transports: (credential.response as any).getTransports(),
			attestation: base64.fromArrayBuffer((credential.response as any).attestationObject)
		});
		addingKey = false;
		if (!response.success)
			return error = response;
		
		data.devices = [...data.devices, response.data];
	};
</script>

<div class="header">
	<h2>{$t('settings.access.security.devices')}</h2>
	<p>{$t('settings.access.security.devices.summary')}</p>
</div>

<div class="devices">
	{#each data.devices as item}
		<SecurityDevice {...item}/>
	{/each}
</div>
<div class="buttons">
	<Button on:click={trigger} disabled={addingKey}>
		<Plus/>{$t('settings.access.security.create')}
	</Button>
</div>
<RequestError data={error} background="var(--background-primary)"/>

<ContextMenu.Root bind:trigger>
	<p>{$t('settings.access.security.create.name')}</p>
	<TextInput bind:value={securityKeyName}/>
	<br/><br/>
	<button type="button" on:click={addDevice}>
		<Check/>{$t('action.continue')}
	</button>
</ContextMenu.Root>

<style lang="scss">
	.devices {
		gap: 16px;
		display: flex;
		flex-direction: column;
	}
	.buttons {
		margin: 16px 0;
	}
</style>