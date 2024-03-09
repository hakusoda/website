<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';

	import Plus from 'virtual:icons/bi/plus-lg';
	import Sunrise from 'virtual:icons/bi/sunrise';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import PeopleFill from 'virtual:icons/bi/people-fill';
	export let data;

	let itemFilter = '';
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('koko.experience.servers')}</h1>
		<p>{$t('koko.experience.servers.summary')}</p>
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
		{#each data.items as item, index}
			<a class="item" href={`/koko/experience/${$page.params.id}/servers/${item.id}`}>
				<div class="info">
					<h1>{item.id}</h1>
					<div class="details">
						<p>
							<Sunrise/>
							{$t('time_ago', [item.created_at])}
						</p>
						<p>
							<PeopleFill/>
							{$t('label.players', [item.players.length])}
						</p>
					</div>
				</div>
				<button type="button" class="options" on:click|preventDefault>
					<ThreeDots/>
				</button>
			</a>
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
			width: -moz-available;
			color: var(--color-primary);
			width: -webkit-fill-available;
			border: none;
			cursor: pointer;
			display: flex;
			padding: 0 28px;
			font-size: 1em;
			min-height: 80px;
			text-align: start;
			transition: opacity .5s, box-shadow .5s;
			background: var(--background-secondary);
			box-shadow: inset 0 0 0 1px var(--border-primary);
			align-items: center;
			font-family: var(--font-primary);
			border-radius: 32px;
			text-decoration: none;
			.info {
				margin: 0 auto 0 0;
				h1 {
					margin: 0 0 6px;
					font-size: .9em;
					font-weight: 500;
				}
				.details {
					gap: 8px;
					margin: 8px 0 0;
					display: flex;
					p {
						gap: 6px;
						color: var(--color-secondary);
						margin: 0;
						height: 24px;
						display: flex;
						padding: 0 10px;
						font-size: .75em;
						box-shadow: 0 0 0 1px var(--border-secondary);
						align-items: center;
						border-radius: 16px;
					}
				}
			}
			.options {
				color: var(--color-primary);
				border: none;
				cursor: pointer;
				padding: 8px;
				display: flex;
				background: none;
				transition: background .5s;
				border-radius: 50%;
				&:hover {
					background: #ffffff1a;
				}
			}
			&:not(:disabled):hover {
				box-shadow: inset 0 0 0 1px var(--border-secondary);
			}
			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
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