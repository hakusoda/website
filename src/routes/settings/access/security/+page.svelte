<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button, TextInput, DropdownMenu } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';
	import type { ApiRequestError } from '$lib/types';
	import { verifyNewDevice, getNewDeviceOptions, removeSecurityDevice } from '$lib/api';

	import RequestError from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Phone from '$lib/icons/Phone.svelte';
	import Display from '$lib/icons/Display.svelte';
	export let data: PageData;

	let trigger: () => void;

	let error: ApiRequestError | null = null;
	let addingKey = false;
	let removingDevices: string[] = [];
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
	const removeDevice = async (id: string) => {
		error = null;
		removingDevices = [...removingDevices, id];
		const response = await removeSecurityDevice(id);
		removingDevices = removingDevices.filter(item => item !== id);

		if (!response.success)
			return error = response;
		data.devices = data.devices.filter(item => item.id !== id);
	};

	const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
</script>

<div class="security">
	<h1>{$t('settings.access.security.devices')}</h1>
	<p class="summary">{$t('settings.access.security.devices.summary')}</p>

	<div class="devices">
		{#each data.devices as item}
			<div class="item">
				{#if /i(Pad)?OS/.test(item.user_os) || item.user_os === 'Android'}
					<Phone size={32}/>
				{:else}
					<Display size={32}/>
				{/if}
				<div class="name">
					<h1>{item.name}</h1>
					<p>
						{$t('settings.access.security.device.registered', [item])}
						{#if item.user_country}
							{$t('settings.access.security.device.registered.origin', [regionNames.of(item.user_country)])}
						{/if}
					</p>
				</div>
				<div class="buttons">
					<Button on:click={() => removeDevice(item.id)} disabled={removingDevices.includes(item.id)}>
						<X/>{$t('action.remove')}
					</Button>
				</div>
			</div>
		{/each}
	</div>
	<div class="buttons">
		<DropdownMenu.Root bind:trigger>
			<Button slot="trigger" on:click={trigger} disabled={addingKey}>
				<Plus/>{$t('settings.access.security.create')}
			</Button>
	
			<p>{$t('settings.access.security.create.name')}</p>
			<TextInput bind:value={securityKeyName}/>
			<br/><br/>
			<button type="button" on:click={addDevice}>
				<Check/>{$t('action.continue')}
			</button>
		</DropdownMenu.Root>
	</div>
	<RequestError data={error} background="var(--background-primary)"/>
</div>

<style lang="scss">
	.security {
		width: 100%;
		margin: 0 64px 32px;
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
			margin-bottom: 32px;
		}
		.devices {
			gap: 8px;
			display: flex;
			flex-direction: column;
			.item {
				display: flex;
				padding: 16px 20px 16px 28px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 36px;
				.name {
					margin-left: 24px;
					h1 {
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .8em;
					}
				}
				.buttons {
					gap: 16px;
					margin: 0 0 0 auto;
					display: flex;
				}
			}
		}
		.buttons {
			margin: 16px 0;
		}
	}
</style>