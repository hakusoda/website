<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import { RequestErrorType } from '$lib/enums';
	import type { TeamInvite, ApiRequestError } from '$lib/types';
	import { acceptTeamInvite, rejectTeamInvite } from '$lib/api';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import RequestError from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	import Hourglass from '$lib/icons/Hourglass.svelte';
	import EnvelopePlus from '$lib/icons/EnvelopePlus.svelte';
	export let id: string;
	export let name: string;
	export let data: TeamInvite;
	export let avatar: string | null;
	export let userAvatar: string | null;

	let invalid = false;
	let verifying = false;
	const verify = async () => {
		verifying = !(invalid = false);
	};
	const cancel = () => {

	};
</script>

<Modal autoOpen>
	<div class="header">
		<Avatar src={avatar} size="md" hover/>
		<Avatar src={data.author?.avatar_url} size="sm" hover circle/>
		<EnvelopePlus size={48}/>
		<Avatar src={userAvatar} size="md" hover circle/>
	</div>

	<h1>{$t('modal.team_invite')}</h1>
	<p class="summary">{$t('modal.team_invite.summary', [name])}</p>

	<RequestError data={error}/>
	<div class="buttons">
		<Button on:click={accept} disabled={accepting}>
			{#if accepting}
				<Hourglass/>
			{:else}
				<Check/>
			{/if}
			{$t('action.accept')}
		</Button>
		<form method="dialog">
			<Button on:click={reject} disabled={accepting}>
				<X/>{$t('action.reject')}
			</Button>
		</form>
	</div>
</Modal>

<style lang="scss">
	.summary {
		color: var(--color-secondary);
		margin-bottom: 16px;
	}
	.buttons {
		gap: 16px;
		display: flex;
		margin-top: 16px;
	}
</style>