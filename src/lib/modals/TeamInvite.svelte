<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import type { TeamInvite, ApiRequestError } from '$lib/types';
	import { acceptTeamInvite, rejectTeamInvite } from '$lib/api';

	import Modal from '$lib/components/Modal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import RequestError from '$lib/components/RequestError.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import Hourglass from 'virtual:icons/bi/hourglass';
	import EnvelopePlus from 'virtual:icons/bi/envelope-plus';
	import WavingHandEmoji from '$lib/icons/WavingHandEmoji.svelte';
	export let id: string;
	export let name: string;
	export let data: TeamInvite;
	export let avatar: string | null = null;
	export let userAvatar: string | null = null;

	let state = 0;
	let error: ApiRequestError | null = null;
	let accepting = false;
	const accept = async () => {
		accepting = !(error = null);
		
		const response = await acceptTeamInvite(id, data.id);
		if (response.success)
			state++;
		else
			accepting = !(error = response.error);
	};
	const reject = async () =>
		await rejectTeamInvite(id, data.id);
</script>

<Modal autoOpen>
	{#if !state}
		<div class="header">
			<Avatar src={avatar} size="md" hover/>
			<Avatar src={data.author?.avatar_url} size="sm" hover circle/>
			<EnvelopePlus font-size={48}/>
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
	{:else}
		<div class="header">
			<Avatar src={avatar} size="md" hover/>
			<Avatar src={data.author?.avatar_url} size="sm" hover circle/>
			<WavingHandEmoji size={64}/>
			<Avatar src={userAvatar} size="md" hover circle/>
		</div>

		<h1>{$t('modal.team_invite.welcome')}</h1>
		<p class="summary">{$t('modal.team_invite.welcome.summary', [name])}</p>

		<div class="buttons">
			<Button on:click={() => location.reload()}>
				<Check/>{$t('action.acknowledge')}
			</Button>
		</div>
	{/if}
</Modal>

<style lang="scss">
	.header, h1, .summary, .buttons {
		margin-left: auto;
		margin-right: auto;
	}
	.header {
		gap: 48px;
		display: flex;
		position: relative;
		margin-top: 16px;
		align-items: center;
		margin-bottom: 16px;
		:global(.avatar:nth-of-type(2)) {
			top: 56px;
			left: 56px;
			position: absolute;
		}
	}
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