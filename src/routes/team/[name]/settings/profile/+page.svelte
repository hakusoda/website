<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { updateTeam } from '$lib/api';
	import type { PageData } from './$types';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';

	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	let name = data.name;
	$: name = name.slice(0, 20).toLowerCase().replace(/ /g, '_').replace(/\W/g, '');

	const save = async () => {
		if (name.length < 3)
			return error = { error: RequestErrorType.NameTooShort } satisfies RequestError;
		saving = !(error = null);
		
		const response = await updateTeam(data.session!.access_token, data.id, { name });
		if (response.success)
			return goto(`/team/${name}/settings/profile`).then(() => saving = false);

		saving = !(error = response);
	};
	const reset = () => (name = data.name, error = null);
</script>

<div class="main">
	<h1>{$t('team.settings.profile.header')}</h1>
	<div class="profile">
		<div class="header">
			<Avatar src={data.avatar_url} size="md" hover/>
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
		<p class="details">{$t('team.created.false', [data.created_at])}</p>
	</div>

	<p class="input-label">{$t('team.settings.profile.name')}</p>
	<TextInput bind:value={name}/>

	<UnsavedChanges
		show={name !== data.name}
		error={error ? $t(`request_error.${error.error}`) : ''}
		{save}
		{reset}
		{saving}
	/>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 32px 128px 32px 64px;
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
	}
</style>