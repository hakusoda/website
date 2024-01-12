<script lang="ts">
	import { t } from '../localisation';
	import { likePost, unlikePost } from '$lib/api';

	import Avatar from './Avatar.svelte';
	import Markdown from './Markdown.svelte';
	import ProfilePostAttachment from './ProfilePostAttachment.svelte';

	import Chat from 'virtual:icons/bi/chat';
	import Heart from 'virtual:icons/bi/heart';
	import HeartFill from 'virtual:icons/bi/heart-fill';
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
	export let liked = false;
	export let content: string;
	export let comments = 0;
	export let created_at: string;
	export let attachments: { url: string }[] = [];

	const like = async () => {
		const initialCount = likes, initialState = liked;
		if (!liked)
			likes += 1;
		liked = !liked;

		const response = await (liked ? likePost(id) : unlikePost(id));
		if (!response.success) {
			alert($t(`request_error.${response.error as 0}`));
			likes = initialCount, liked = initialState;
		}
	};
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
		<button type="button">
			<Chat/>{$t('number', [comments])}
		</button>
		<button type="button" class="like" title={$t(`profile_post.like.${liked}`)} class:liked on:click|preventDefault={like}>
			{#if liked}
				<HeartFill/>
			{:else}
				<Heart/>
			{/if}
			{$t('number', [likes])}
		</button>
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
			button {
				gap: 8px;
				color: var(--color-secondary);
				margin: 0;
				border: none;
				cursor: pointer;
				padding: 0;
				display: flex;
				font-size: .9em;
				background: none;
				align-items: center;
				font-family: var(--font-primary);
				&.liked, &.like:hover {
					color: var(--button-background);
				}
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