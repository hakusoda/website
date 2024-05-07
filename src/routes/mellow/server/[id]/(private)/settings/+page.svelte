<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { updateMellowServerOwnership } from '$lib/client/api';

	import Modal from '$lib/ui/components/Modal.svelte';
	import TeamSelect from '$lib/ui/components/TeamSelect.svelte';

	import X from 'virtual:icons/bi/x-lg';
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
	<div class="content">
		<TeamSelect bind:value/>
		<button class="top_button" type="button" on:click={trigger} disabled={transferring}>
			<X/>
		</button>
	</div>
	<div class="footer">
		<div>
			{#if value}
				{@const team = data.user?.teams.find(item => item.team.id === value)?.team}
				<h2>{$t('modal.transfer_to_team.selected', [team?.display_name ?? team?.name])}</h2>
				<p>{$t('modal.transfer_to_team.selected.note')}</p>
			{:else}
				<h2>{$t('modal.transfer_to_team')}</h2>
				<p>{$t('modal.transfer_to_team.note')}</p>
			{/if}
		</div>
		<button type="button" on:click={transfer} disabled={!value || transferring}>
			{$t('action.transfer')}
		</button>
	</div>
</Modal>

<style lang="scss">
	.content {
		display: flex;
	}
</style>