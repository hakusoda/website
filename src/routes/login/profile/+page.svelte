<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { goto } from '$app/navigation';
	import { createProfile } from '$lib/api';
	import type { PageData } from './$types';

	import Check from '$lib/icons/Check.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	export let data: PageData;
	let username = '';

	let error = false;
	let files: FileList;
	let avatar: string | null = null;
	let creating = false;
	let fileInput: HTMLInputElement;
	const fileChange = () => {
		const reader = new FileReader();
		reader.readAsDataURL(files[0]);
		reader.onload = event => avatar = event.target!.result as string;
	};

	const create = async () => {
		error = false;
		creating = true;
		const response = await createProfile(data.session!.access_token, username, await files[0]?.arrayBuffer());
		if (response.error) {
			error = true;
			creating = false;
			return;
		}
		goto(`/user/${response.data.username}`);
	};
</script>

<div class="main">
	<h1>{$t('create_profile')}</h1>
	<div class="profile">
		<div class="avatar">
			<Avatar src={avatar} circle on:click={() => fileInput.click()}/>
			<p>{$t('create_profile.avatar')}</p>
		</div>
		<input type="file" accept="image/png" bind:this={fileInput} bind:files on:change={fileChange}>
		<div class="details">
			{#if error}
				<p>{$t('create_profile.error')}</p>
			{/if}
			<TextInput bind:value={username} placeholder={$t('create_profile.username')}/>
			<Button on:click={create} disabled={creating}><Check/>{$t('create_profile.finish')}</Button>
		</div>
	</div>
</div>

<style lang="scss">
	.main {
		margin: auto;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			margin-bottom: 24px;
		}
		.profile {
			display: flex;
			align-items: center;
			.avatar {
				gap: 24px;
				display: flex;
				align-items: center;
				flex-direction: column;
				:global(.avatar) {
					cursor: pointer;
					&:hover {
						filter: brightness(0.95);
					}
				}
				p {
					color: var(--color-tertiary);
					font-size: .8em;
				}
			}
			input {
				display: none;
			}
			.details {
				gap: 8px;
				display: flex;
				margin-left: 48px;
				flex-direction: column;
			}
		}
	}
</style>