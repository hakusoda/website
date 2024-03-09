<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import Plus from 'virtual:icons/bi/plus-lg';
	import SendFill from 'virtual:icons/bi/send-fill';
	export let data;

	let itemFilter = '';
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('koko.experience.server_actions')}</h1>
		<p>{$t('koko.experience.server_actions.summary')}</p>
	</div>
</div>

<div class="geist">
	<div class="buttons">
		<TextInput bind:value={itemFilter} placeholder={$t('action.search')}/>
		<Button href={`/mellow/server/${$page.params.id}/syncing/actions/create`}>
			<Plus/>{$t('mellow.server.settings.syncing.actions.create')}
		</Button>
	</div>
	<div class="items">
		{#each data.items as item}
			<div class="item">
				<p>{item.name}</p>
				<button type="button">
					<SendFill/>Trigger
				</button>
			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	.items {
		gap: 16px;
		width: 100%;
		height: 100%;
		display: flex;
		padding: 16px 0;
		overflow: auto;
		flex-direction: column;
		.item {
			width: fit-content;
			color: var(--color-primary);
			border: none;
			cursor: pointer;
			display: flex;
			padding: 16px;
			font-size: 1em;
			min-width: 128px;
			text-align: start;
			transition: opacity .5s, box-shadow .5s;
			background: var(--background-secondary);
			box-shadow: inset 0 0 0 1px var(--border-primary);
			font-family: var(--font-primary);
			border-radius: 32px;
			flex-direction: column;
			text-decoration: none;
			p {
				margin: 8px 8px 0;
			}
			button {
				gap: 12px;
				width: 100%;
				color: var(--button-color);
				border: none;
				height: 32px;
				cursor: pointer;
				margin: 16px 0 0;
				padding: 0;
				display: flex;
				font-size: .9em;
				background: var(--button-background);
				box-shadow: inset 0 0 0 1px #ffffff40;
				transition: background .5s, box-shadow .5s;
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 16px;
				justify-content: center;
				&:not(:disabled):hover {
					background: var(--button-background-hover);
					box-shadow: inset 0 0 0 1px var(--border-secondary);
				}
				&:disabled {
					cursor: not-allowed;
					opacity: 0.5;
				}
			}
		}
	}
	.buttons {
		gap: 16px;
		margin: 16px 0 0;
		display: flex;
		justify-content: space-between;
	}
</style>