<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;

	let error = false;
	let finishing = false;
	const submit = async (event: Event) => {
		error = false;
		finishing = true;
       	const response = await fetch((event.target as HTMLFormElement).action, {
			body: data.linkId,
            method: 'POST'
        });
		if (response.status === 200)
			return goto('/settings/roblox/verification');
		finishing = !(error = true);
    }
</script>

<div class="main">
	<h1>{$t('roblox.verification.finish')}</h1>
	<a class="user" href={`https://www.roblox.com/users/${data.user?.id}/profile`} target="_blank">
		<Avatar src={data.icon.imageUrl} size="md"/>
		<div class="name">
			<h1>{data.user?.displayName}</h1>
			<p>@{data.user?.name}</p>
		</div>
	</a>
	<p class="sub">{$t('roblox.verification.finish.sub', [data.user?.created, data.user?.id])}</p>
	{#if error}
		<p>{$t('error.unknown')}</p>
	{/if}
	<div class="buttons">
		<form method="POST" on:submit|preventDefault={submit}>
			<Button disabled={finishing}>
				<Check/>{$t('roblox.verification.finish.yes')}
			</Button>
		</form>
		<Button href="/roblox/authorise" disabled={finishing}>
			<X/>{$t('roblox.verification.finish.no')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 64px auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		.user {
			display: flex;
			margin-top: 32px;
			align-items: center;
			text-decoration: none;
			.name {
				margin-left: 24px;
				h1 {
					margin: 0 0 4px;
					font-size: 2.25em;
				}
				p {
					color: var(--color-secondary);
					margin: 0;
				}
			}
		}
		.sub {
			color: var(--color-secondary);
			font-size: .8em;
			margin-top: 16px;
		}
		.buttons {
			gap: 16px;
			display: flex;
			margin-top: 48px;
		}
	}
</style>