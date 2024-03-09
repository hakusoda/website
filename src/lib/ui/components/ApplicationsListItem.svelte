<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { invalidateAll } from '$app/navigation';
	import { revokeApplication } from '$lib/client/api';

	import Avatar from './Avatar.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import ThreeDots from 'virtual:icons/bi/three-dots';

	export let id: string;
	export let updated_at: string;
	export let application: {
		id: string
		name: string
		owner: {
			id: string
			name: string
			display_name: string
		}
		summary: string
		avatar_url: string
	};

	let trigger: () => void;
	let revoking = false;
	const revoke = async () => {
		revoking = true;

       	const response = await revokeApplication(id);
		if (response.success)
			await invalidateAll();
		else
			alert($t(`request_error.${response.error as 0}`));

			revoking = false;
    };
</script>

<div class="applications-list-item">
	<Avatar id={application.id} src={application.avatar_url} size="xs"/>
	<div class="details">
		<h1>{application.name}</h1>
		<p>{application.summary}</p>
	</div>
	<p class="created">{$t('application.last_used', [updated_at])}</p>
	<button type="button" class="options" on:click={trigger}>
		<ThreeDots/>
	</button>
	<ContextMenu.Root bind:trigger>
		<button type="button" on:click={revoke} disabled={revoking}>
			<X/>{$t('action.revoke')}
		</button>
	</ContextMenu.Root>
</div>

<style lang="scss">
	.applications-list-item {
		height: 64px;
		display: flex;
		padding: 0 28px;
		background: var(--background-secondary);
		align-items: center;
		border-radius: 32px;
		.details {
			margin: 0 auto 0 24px;
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
		.created {
			color: var(--color-secondary);
			margin: 0 24px;
			font-size: .8em;
		}
		.options {
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			padding: 0;
			background: none;
		}
	}
</style>