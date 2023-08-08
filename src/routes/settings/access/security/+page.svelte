<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;

	let code = '';
	let qrCode = '';
	let factorId = '';
	const addAuthenticator = async () => {
		const response = await data.supabase.auth.mfa.enroll({
			factorType: 'totp'
		});
		if (response.error)
			return console.error(response.error);
	
		const { id, type, totp: { uri, secret, qr_code } } = response.data;
		qrCode = qr_code, factorId = id;
	};
	const verify = async () => {
		const response = await data.supabase.auth.mfa.challengeAndVerify({
			code,
			factorId
		});
		if (response.error)
			return console.error(response.error);

		location.reload();
	};
</script>

<div class="security">
	<Button on:click={addAuthenticator}>
		add authenticator
	</Button>
	
	{#if qrCode}
		<Avatar src={qrCode} size="lg2" transparent/>
	
		<p>input code</p>
		<TextInput bind:value={code}/>
		<Button on:click={verify}>
			<Check/>{$t('action.continue')}
		</Button>
	{/if}
</div>