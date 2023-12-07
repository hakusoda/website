<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	import X from '$lib/icons/X.svelte';
	import Check from '$lib/icons/Check.svelte';
	export let data: PageData;

	$: teamUrl = `/team/${$page.params.name}`;
</script>

<div class="main">
	<h1>{$t('team.invite', [data.display_name])}</h1>
	<p class="summary">{$t('team.invite.summary')}</p>

	<div class="buttons">
		<Button href={teamUrl}>
			<Check/>{$t('team.invite.done')}
		</Button>
		<Button href={teamUrl} colour="secondary">
			<X/>{$t('team.invite.skip')}
		</Button>
	</div>
</div>

<style lang="scss">
	.main {
		margin: 64px auto;
		display: flex;
		flex-direction: column;
		h1, p {
			text-align: center;
		}
		.summary {
			color: var(--color-secondary);
			font-size: .9em;
		}
		.buttons {
			gap: 16px;
			margin: 64px auto 0;
			display: flex;
		}
	}
</style>