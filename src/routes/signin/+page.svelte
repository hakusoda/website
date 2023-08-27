<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';

	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';
	import KeyFill from '$lib/icons/KeyFill.svelte';

	let username = '';
</script>

<div class="signin">
	<h2>{$t('signin.social')}</h2>
	<div class="social">
		<button type="button">
			<Discord size={24} coloured/>Discord
		</button>
		<button type="button">
			<GitHub size={24}/>GitHub
		</button>
	</div>

	<h2>{$t('signin.manual')}</h2>
	<div class="manual">
		<TextInput bind:value={username} placeholder={$t('signin.manual.name')}/>
		<Button>
			<KeyFill/>{$t('action.continue')}
		</Button>
	</div>

	<a href="/signup">
		{$t('login.signup')}
	</a>
</div>

<style lang="scss">
	.signin {
		margin: auto;
		display: flex;
		padding: 24px;
		background: var(--background-secondary);
		border-radius: 24px;
		flex-direction: column;
		h2 {
			margin: 32px 0 16px;
			&:first-child {
				margin-top: 4px;
			}
		}
		.social {
			gap: 16px;
			display: flex;
			button {
				gap: 16px;
				width: 192px;
				color: var(--color-primary);
				border: none;
				display: flex;
				padding: 8px 16px;
				font-size: 1em;
				background: var(--background-primary);
				box-shadow: var(--button-shadow);
				font-weight: 500;
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 8px;
			}
		}
		.manual {
			gap: 16px;
			display: flex;
			:global(.text-input) {
				width: 100%;
			}
		}
		a {
			color: var(--color-link);
			margin: 32px auto 0;
		}
	}
</style>