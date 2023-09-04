<script lang="ts">
	import { Button } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let finishing = false;
	const submit = async () => {
		error = null;
		finishing = true;
       	const response = await fetch('?/confirm', { body: data.linkId,  method: 'POST' });
		const result = deserialize(await response.text());
		if (result.type === 'success')
			return goto('/settings/roblox/accounts');
		else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline } satisfies RequestError;
		finishing = false;
    }
</script>

<div class="main">
	<h1>{$t('roblox.verification.finish')}</h1>
	<a class="user" href={`https://www.roblox.com/users/${data.user?.id}/profile`} target="_blank">
		<Avatar src={data.icon.imageUrl} size="md" circle/>
		<div class="name">
			<h1>{data.user?.displayName}</h1>
			<p>@{data.user?.name}</p>
		</div>
	</a>
	<p class="sub">{$t('roblox.verification.finish.sub', [data.user?.created, data.user?.id])}</p>
	<RequestErrorUI data={error}/>
	<div class="buttons">
		<Button on:click={submit} disabled={finishing}>
			<Check/>{$t('roblox.verification.finish.yes')}
		</Button>
		<Button href="/roblox/authorise" colour="secondary" disabled={finishing}>
			<X/>{$t('roblox.verification.finish.no')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		display: flex;
		min-height: calc(100svh - 58px);
		align-items: center;
		flex-direction: column;
		h1 {
			margin-top: 96px;
		}
		.user {
			display: flex;
			margin-top: 32px;
			align-items: center;
			text-decoration: none;
			.name {
				margin-left: 32px;
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