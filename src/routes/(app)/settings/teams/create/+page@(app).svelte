<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { goto } from '$app/navigation';
	import type { ApiRequestError } from '$lib/shared/types';
	import { createTeam, update_team_avatar } from '$lib/client/api';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	import AvatarFile from '$lib/ui/components/AvatarFile.svelte';
	import RequestError from '$lib/ui/components/RequestError.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import Hourglass from 'virtual:icons/bi/hourglass';

	let error: ApiRequestError | null = null;
	let avatar: ArrayBuffer | null = null;
	let creating = false;
	let avatarUri: string | null = null;
	let displayName = '';

	$: name = displayName.toLowerCase().replace(/ /g, '_').replace(/\W/g, '');
	const create = async () => {
		creating = !(error = null);

		const response = await createTeam(displayName || 'My Team');
		if (response.success) {
			const team = response.data;
			if (avatar)
				await update_team_avatar(team.id, avatar);
			return goto(`/team/${team.name}/invite`);
		}
		
		creating = !(error = response);
	};
</script>

<div class="main">
	<h1>{$t('settings.access.teams.create.header')}</h1>

	<div class="container">
		<div class="preview">
			<div class="header">
				<Avatar src={avatarUri} size="md"/>
				<div class="name">
					<h1>{displayName || 'My Team'}</h1>
					<p>@{name || 'my_team'}</p>
				</div>
			</div>
		</div>
		<div class="input">
			<p class="input-label">{$t('settings.access.teams.create.name')}</p>
			<TextInput placeholder="My Team" bind:value={displayName}/>

			<p class="input-label">{$t('settings.access.teams.create.avatar')}</p>
			<AvatarFile name={displayName || 'My Team'} bind:result={avatar} bind:resultUri={avatarUri}/>
		</div>
	</div>

	<RequestError data={error} background="var(--background-primary)"/>
	<div class="buttons">
		<Button on:click={create} disabled={creating}>
			{#if creating}
				<Hourglass/>
			{:else}
				<Check/>
			{/if}
			{$t('action.next')}
		</Button>
		<Button href="/settings/teams" colour="secondary" disabled={creating}>
			<X/>{$t('action.cancel')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 32px auto;
		display: flex;
		flex-direction: column;
		h1 {
			text-align: center;
		}
		.container {
			display: flex;
			.preview {
				width: 448px;
				padding: 16px 16px 32px;
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
				}
			}
			.input {
				margin-left: 64px;
			}
		}
		.input-label {
			margin: 32px 0 8px;
			font-size: .9em;
		}
		.buttons {
			gap: 16px;
			margin: 128px auto 0;
			display: flex;
		}
	}
</style>