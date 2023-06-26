<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { deserialize } from '$app/forms';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';
	export let data: PageData;

	import Avatar from '$lib/components/Avatar.svelte';
	import RequestErrorUI from '$lib/components/RequestError.svelte';

	import PencilFill from '$lib/icons/PencilFill.svelte';
	import PersonFill from '$lib/icons/PersonFill.svelte';

	let error: RequestError | null = null;
	let saving = false;
	let name = data.name;
	$: name = name.slice(0, 20);

	const save = async () => {
		saving = !(error = null);
		const response = await fetch('?/edit', {
			body: JSON.stringify({ name }),
			method: 'POST'
		});
		const result = deserialize(await response.text());
		if (result.type === 'success') {
			saving = false;
			return goto(`/team/${name}/settings/profile`);
		} else if (result.type === 'failure')
			error = result.data as any;
		else if (result.type === 'error')
			error = { error: RequestErrorType.Offline } satisfies RequestError;
		saving = false;
	};
</script>

<div class="main">
	<h1>{$t('team.settings.profile.header')}</h1>
	<div class="profile">
		<div class="header">
			<Avatar src={data.avatar_url} size="md"/>
			<div class="name">
				<h1>{data.display_name}</h1>
				<p>@{name}</p>
			</div>
			<div class="buttons">
				<Button href={`/team/${data.name}`}>
					<PersonFill/>{$t('action.view_profile')}
				</Button>
			</div>
		</div>
		<p class="details">{$t('team.joined', [data.created_at])}</p>
	</div>

	<p class="input-label">{$t('team.settings.profile.name')}</p>
	<TextInput bind:value={name}/>

	<RequestErrorUI data={error} background="var(--background-primary)"/>
	<div class="buttons">
		<Button on:click={save} disabled={saving || name === data.name}>
			<PencilFill/>{$t('action.save_changes')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 256px 32px 64px;
		.profile {
			padding: 16px;
			position: relative;
			margin-top: 64px;
			background: var(--background-secondary);
			border-radius: 16px;
			.header {
				display: flex;
				padding: 0 0 0 128px;
				:global(.avatar) {
					top: -32px;
					left: 24px;
					position: absolute;
					box-shadow: 0 8px 16px 2px #00000040;
				}
				.name {
					h1 {
						margin: 0;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .9em;
					}
				}
				.buttons {
					margin-left: auto;
				}
			}
			.details {
				color: var(--color-secondary);
				margin: 24px 0 0;
				font-size: .9em;
			}
		}
		.input-label {
			color: var(--color-secondary);
			margin: 32px 0 8px;
			font-size: .9em;
		}
		.buttons {
			gap: 16px;
			display: flex;
		}
		& > .buttons {
			margin-top: 32px;
		}
	}
</style>