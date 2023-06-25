<script lang="ts">
	import { t } from '$lib/localisation';
    import type { PageData } from './$types';
	import { MellowServerAuditLogType } from '$lib/enums';
    
	import Avatar from '$lib/components/Avatar.svelte';
	import CaretDown from '$lib/icons/CaretDown.svelte';
    export let data: PageData;

	let open: string[] = [];
	const OPENABLE = [MellowServerAuditLogType.CreateRobloxLink, MellowServerAuditLogType.UpdateRobloxGlobalSettings];
</script>

<div class="main">
	{#each data.items as item}
		<div class="item">
			<svelte:element this={OPENABLE.includes(item.type) ? 'button' : 'div'} type="button" class="header focusable" on:click={OPENABLE.includes(item.type) ? () => open = open.includes(item.id) ? open.filter(i => i !== item.id) : [...open, item.id] : null}>
				<Avatar src={item.author.avatar_url} size="sm" circle/>
				<div class="details">
					<h1><a href={`/user/${item.author.username}`}>{item.author.username}</a> {$t(`mellow_server_audit_log.type.${item.type}`, [item])}</h1>
					<p>{$t('time_ago', [item.created_at])}</p>
				</div>
				{#if OPENABLE.includes(item.type)}
					<CaretDown/>
				{/if}
			</svelte:element>
			{#if open.includes(item.id)}
				<div class="details">
					{#if item.type === MellowServerAuditLogType.UpdateRobloxGlobalSettings}
						{#if item.data.default_nickname}
							<p>{$t('mellow_server_audit_log.type.2.default_nickname', [item])}</p>
						{/if}
					{/if}
					{#if item.type === MellowServerAuditLogType.CreateRobloxLink}
						<p>{$t(`mellow_bind.bound.${item.data.type}`, [item.data.targets])}, {$t('mellow_bind.requirements.with', [item.data.requirements])}</p>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.main {
		gap: 16px;
		width: 100%;
		margin: 32px;
		display: flex;
		overflow: hidden auto;
		flex-direction: column;
		.item {
			background: var(--background-secondary);
			border-radius: 16px;
			.header {
				width: 100%;
				border: none;
				padding: 8px;
				display: flex;
				font-size: 1em;
				background: none;
				text-align: start;
				align-items: center;
				font-family: var(--font-primary);
				border-radius: 16px;
				.details {
					margin-left: 16px;
					h1 {
						color: var(--color-tertiary);
						margin: 0;
						font-size: 1em;
						font-weight: 500;
					}
					p {
						color: var(--color-secondary);
						margin: 4px 0 0;
						font-size: .8em;
					}
				}
				:global(svg) {
					color: var(--color-primary);
					margin: 0 16px 0 auto;
				}
				&:is(button) {
					cursor: pointer;
				}
			}
			& > .details {
				padding: 16px;
				border-top: 1px solid var(--border-secondary);
				p {
					color: var(--color-tertiary);
					margin: 0;
					font-size: .9em;
				}
			}
		}
	}
</style>