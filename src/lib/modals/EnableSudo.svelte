<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button } from '@voxelified/voxeliface';

	import { t } from '../localisation';
	import { RequestErrorType } from '../enums';
	import type { RequestError } from '../types';
	import { sudoModal, sudoEnabled } from '../store';
	import { verifySudoMode, getSudoModeOptions } from '../api';
	
	import Modal from '../components/Modal.svelte';

	import X from '../icons/X.svelte';
	import KeyFill from '../icons/KeyFill.svelte';

	let error: RequestError | null;
	let enabling = false;
	const enable = async () => {
		enabling = !(error = null);

		try {
			const options = await getSudoModeOptions();
			if (!options.success)
				return enabling = !(error = options);

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

			const response = await verifySudoMode({
				id: base64.fromArrayBuffer(credential.rawId),
				authData: base64.fromArrayBuffer((credential.response as any).authenticatorData),
				challenge: options.data.challenge as any,
				signature: base64.fromArrayBuffer((credential.response as any).signature),
				clientData: base64.fromArrayBuffer(credential.response.clientDataJSON)
			});
			if (!response.success)
				return enabling = !(error = response);

			$sudoModal = !($sudoEnabled = true);
		} catch (error) {
			console.error(error);
			enabling = !(error = { error: RequestErrorType.Unknown });
		}	
	};
</script>

<Modal autoOpen>
	<h1>{$t('enable_sudo_mode')}</h1>
	<p>{$t('enable_sudo_mode.summary')}</p>

	<div class="buttons">
		<Button on:click={enable} disabled={enabling}>
			<KeyFill/>{$t('enable_sudo_mode.continue')}
		</Button>
		<form action="dialog">
			<Button colour="secondary" on:click={() => $sudoModal = $sudoEnabled = false} disabled={enabling}>
				<X/>{$t('action.cancel')}
			</Button>
		</form>
	</div>
</Modal>

<style lang="scss">
	h1 {
		margin: 0 auto;
	}
	p {
		color: var(--color-secondary);
		margin: 16px auto 0;
		font-size: .9em;
		text-align: center;
		line-height: normal;
		white-space: pre-line;
	}
	.buttons {
		gap: 16px;
		margin: 48px auto 0;
		display: flex;
	}
</style>