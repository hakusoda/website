<script lang="ts">
	import base64 from '@hexagon/base64';
	import { Button } from '@hakumi/essence';

	import { t } from '../localisation';
	import { RequestErrorType } from '../../shared/enums';
	import type { RequestError } from '../../shared/types';
	import { sudoModal, sudoEnabled } from '../../client/store';
	import { verifySudoMode, getSudoModeOptions } from '../../client/api';
	
	import Modal from '../components/Modal.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import KeyFill from 'virtual:icons/bi/key-fill';

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
	<div class="content">
		<form method="dialog">
			<button class="top_button" on:click={() => $sudoModal = $sudoEnabled = false} disabled={enabling}>
				<X/>
			</button>
		</form>
	</div>
	<div class="footer">
		<div>
			<h2>{$t('enable_sudo_mode')}</h2>
			<p>{$t('enable_sudo_mode.summary')}</p>
		</div>
		<button type="button" on:click={enable} disabled={enabling}>
			{$t('action.verify')}
		</button>
	</div>
</Modal>