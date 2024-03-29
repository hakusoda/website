<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';

	import { t } from '../localisation';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { removeSecurityDevice } from '$lib/client/api';

	import Phone from 'virtual:icons/bi/phone';
	import Trash from 'virtual:icons/bi/trash';
	import Display from 'virtual:icons/bi/display';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	export let id: string;
	export let name: string;
	export let user_os: string;
	export let last_used_at: string;
	export let user_country: string;
	export let user_platform: string;

	const iOSRegex = /i(Pad)?OS/;
	const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

	let trigger: () => void;
	let removing = false;
	const remove = async () => {
		removing = true;
		const response = await removeSecurityDevice(id);
		if (!response.success)
			return alert($t(`request_error.${response.error as 0}`)), removing = false;

		await invalidateAll();
	};
</script>

<div class="security-device">
	{#if iOSRegex.test(user_os) || user_os === 'Android'}
		<Phone font-size={32}/>
	{:else}
		<Display font-size={32}/>
	{/if}
	<div class="details">
		<h1>{name}</h1>
		<p>
			{$t('settings.access.security.device.registered', [user_os, user_platform])}
			{#if user_country}
				{$t('settings.access.security.device.registered.origin', [regionNames.of(user_country)])}
			{/if}
		</p>
	</div>
	<p class="used">
		{$t('settings.access.security.device.last_used', [last_used_at])}
	</p>
	<button type="button" class="options" on:click={trigger}>
		<ThreeDots/>
	</button>
	<ContextMenu.Root bind:trigger>
		<p>{name}</p>
		{#if $page.data.session?.source_device_id !== id}
			<button type="button" on:click={remove} disabled={removing}>
				<Trash/>{$t('action.remove')}
			</button>
		{/if}
	</ContextMenu.Root>
</div>

<style lang="scss">
	.security-device {
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
		.used {
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