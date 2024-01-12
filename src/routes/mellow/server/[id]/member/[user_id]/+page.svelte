<script lang="ts">
	import { t } from '$lib/localisation';
	import { USER_CONNECTION_METADATA } from '$lib/constants/index.js';
	export let data;

	$: user_name = data.name ?? data.username;
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('mellow.server.member.connections', [user_name])}</h1>
		<p>{$t('mellow.server.member.connections.summary', [user_name])}</p>
	</div>
</div>
<div class="geist connections">
	{#each data.connections as { connection: { sub, type, username, avatar_url, website_url, display_name }, last_used_at }}
		<div class="item">
			<svelte:component this={USER_CONNECTION_METADATA[type]?.icon} size={32} font-size={32}/>
			{#if avatar_url}
				<img src={avatar_url} alt="" width="32" height="32"/>
			{/if}
			<div class="details">
				<h1>{$t(`user_connection.type.${type}`)}</h1>
				<p>
					{display_name ?? username ?? sub}
					{#if username}
						<!-- yes, this formatting is strange, formatting it normally results in an unwanted space -->
						({#if website_url}
							<a href={website_url} target="_blank">
								@{username}</a>{:else}
							@{username}{/if})
					{/if}
				</p>
			</div>
			<p class="created">{$t('application.last_used', [last_used_at])}</p>
		</div>
	{/each}
</div>

<style lang="scss">
	.connections {
		gap: 16px;
		display: flex;
		margin-top: 64px;
		flex-direction: column;
		.item {
			height: 64px;
			display: flex;
			padding: 0 28px;
			position: relative;
			background: var(--background-secondary);
			align-items: center;
			border-radius: 32px;
			img {
				border-radius: 50%;
			}
			&:has(img) > :global(svg) {
				top: 32px;
				left: 48px;
				width: 16px;
				height: 24px;
				filter: drop-shadow(0 0 1px #000);
				position: absolute;
			}
			.details {
				margin: 0 auto 0 24px;
				h1 {
					margin: 0;
					font-size: 1em;
					font-weight: 500;
				}
				p {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .8em;
					a {
						color: var(--color-link);
					}
				}
			}
			.created {
				color: var(--color-secondary);
				margin: 0 24px;
				font-size: .8em;
			}
		}
	}
</style>