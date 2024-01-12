<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { updateMellowServerOwnership } from '$lib/api';

	import Modal from '$lib/components/Modal.svelte';
	import TeamSelect from '$lib/components/TeamSelect.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data;

	let value: string | null = null;
	let trigger: () => void;
	let transferring = false;

	// TODO: implement confirmation, akin to vercel's domain transfer
	const transfer = async () => {
		// TODO: handle request errors
		transferring = true;

		const response = await updateMellowServerOwnership($page.params.id, {
			team_id: value!
		});
		if (response.success) {
			await invalidateAll();
			trigger();
		}

		transferring = false;
	};
</script>

<div class="header">
	<h2>{$t('mellow.server.settings.general.transfer')}</h2>
	<p>
		{#if data.owner_team}
			{$t('mellow.server.settings.general.transfer.already_team', [data.owner_team.display_name])}
		{:else}
			{$t('mellow.server.settings.general.transfer.summary')}
		{/if}
	</p>
</div>

<Button on:click={trigger} disabled={!!data.owner_team}>
	<PeopleFill/>{$t('action.transfer')}
</Button>

<Modal bind:trigger>
	<h1>{$t('mellow.server.settings.general.transfer')}</h1>
	<TeamSelect bind:value/>

	<div class="buttons">
		<Button on:click={transfer} disabled={!value || transferring}>
			<Check/>{$t('action.continue')}
		</Button>
		<form method="dialog">
			<Button colour="secondary">
				<X/>{$t('action.cancel')}
			</Button>
		</form>
	</div>
</Modal>

<style lang="scss">
	.buttons {
		gap: 16px;
		margin: 24px 0 0;
		display: flex;
	}
</style>