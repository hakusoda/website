<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { updateProfile } from '$lib/api';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { RequestErrorType } from '$lib/enums';
	import type { RequestError } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';
	import UnsavedChanges from '$lib/modals/UnsavedChanges.svelte';

	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: PageData;

	let error: RequestError | null = null;
	let saving = false;
	let username = data.username;
	$: username = username.slice(0, 20);

	const save = async () => {
		if (username.length < 3)
			return error = { error: RequestErrorType.NameTooShort };
		saving = !(error = null);

		const response = await updateProfile({ username });
		if (response.success)
			return invalidateAll().then(() => saving = false);

		saving = !(error = response);
	};
	const reset = () => (username = data.username, error = null);
</script>

<div class="main">
	<h1>{$t('settings')}</h1>
	<div class="profile">
		<div class="header">
			<Avatar id={data.session?.sub} src={data.avatar_url} size="md" circle/>
			<div class="name">
				<h1>{data.name ?? data.username}</h1>
				<p>@{username}</p>
			</div>
			<div class="buttons">
				<Button href={`/user/${data.username}`}>
					<PersonFill/>{$t('action.view_profile')}
				</Button>
			</div>
		</div>
		<p class="details">{$t('profile.joined', [data.created_at])}</p>
	</div>

	<p class="input-label">{$t('settings.account.username')}</p>
	<TextInput bind:value={username}/>

	<UnsavedChanges
		show={username !== data.username}
		error={error ? $t(`request_error.${error.error}`) : ''}
		{save}
		{reset}
		{saving}
	/>
</div>

<style lang="scss">
	.main {
		width: 100%;
		margin: 0 64px 32px;
		.profile {
			padding: 16px;
			position: relative;
			margin-top: 64px;
			background: var(--background-secondary);
			border-radius: 36px;
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
				margin: 32px 8px 4px;
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