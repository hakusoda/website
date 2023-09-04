<script lang="ts">
	import { t } from '../localisation';

	import Avatar from './Avatar.svelte';
	import Markdown from './Markdown.svelte';
	import ProfilePostAttachment from './ProfilePostAttachment.svelte';

	import Chat from '../icons/Chat.svelte';
	import Heart from '../icons/Heart.svelte';
	export let id: string;
	export let user: {
		id: string
		name: string | null
		username: string
		avatar_url: string | null
	} | null = null;
	export let team: {
		id: string
		name: string
		avatar_url: string | null
		display_name: string
	} | null = null;
	export let likes = 0;
	export let content: string;
	export let comments = 0;
	export let created_at: string;
	export let attachments: { url: string }[] = [];
</script>

<a class="profile-post" href={user ? `/user/${user.username}/post/${id}` : ``}>
	<div class="header">
		<Avatar id={user?.id ?? team?.id} src={user?.avatar_url ?? team?.avatar_url} size="xs" circle/>
		<p class="author">
			<a href={user ? `/user/${user.username}` : ``}>
				{user ? user.name ?? `@${user.username}` : team?.display_name}
			</a>
			{$t('profile_post.posted', [created_at])}
		</p>
	</div>
	<Markdown source={content}/>
	{#if attachments.length}
		<div class="attachments">
			{#each attachments as attachment}
				<ProfilePostAttachment src={attachment.url}/>
			{/each}
		</div>
	{/if}
	<div class="details">
		<p>
			<Chat/>{$t('number', [comments])}
		</p>
		<p>
			<Heart/>{$t('number', [likes])}
		</p>
	</div>
</a>

<style lang="scss">
	.profile-post {
		padding: 16px;
		transition: box-shadow .5s;
		background: var(--background-secondary);
		box-shadow: inset 0 0 0 1px var(--border-primary);
		border-radius: 20px;
		text-decoration: none;
		.header {
			margin: 0 0 12px;
			display: flex;
			align-items: center;
			.author {
				color: var(--color-secondary);
				margin: 0;
				font-size: .95em;
				margin-left: 12px;
			}
		}
		.attachments {
			gap: 16px;
			width: 100%;
			margin: 24px 0 0;
			display: flex;
			overflow: hidden;
		}
		.details {
			gap: 16px;
			margin: 24px 0 0;
			display: flex;
			p {
				gap: 8px;
				color: var(--color-secondary);
				margin: 0;
				cursor: pointer;
				display: flex;
				font-size: .9em;
				align-items: center;
				&:hover {
					color: var(--color-primary);
				}
			}
		}
		&:hover {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
		@media (max-width: 512px) {
			border-radius: 0;
		}
	}
</style>