<script lang="ts">
	import { t } from '$lib/localisation';

	import '$lib/styles/auth.scss';
	import GitHub from '$lib/icons/GitHub.svelte';
	import Discord from '$lib/icons/Discord.svelte';
</script>

<div class="auth-modal">
	<h2>{$t('signup.social')}</h2>
	<div class="social">
		<button type="button">
			<Discord size={24} coloured/>Discord
		</button>
		<button type="button">
			<GitHub size={24}/>GitHub
		</button>
	</div>

	<h2>{$t('signup.manual')}</h2>
	<p class="apology">not yet a feature! sorry!!!</p>

	<p>
		{$t('signup.signin')}
		<a href="/sign-in">
			{$t('action.sign_in')}
		</a>
	</p>
</div>

<style lang="scss">
	.auth-modal {
		.apology {
			color: var(--color-secondary);
			margin: 0;
		}
		p {
			color: var(--color-tertiary);
			margin: 32px auto 0;
			a {
				color: var(--color-link);
			}
		}
	}
</style>