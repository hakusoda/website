<script lang="ts">
	import { onMount } from 'svelte';
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { createChildPost } from '$lib/api';
	import type { ApiRequestError } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
	import ProfilePost from '$lib/components/ProfilePost.svelte';
	import RequestError from '$lib/components/RequestError.svelte';

	import Chat from '$lib/icons/Chat.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Heart from '$lib/icons/Heart.svelte';
	export let data: PageData;

	let replying = false;
	let replyError: ApiRequestError | null = null;
	let replyContent = '';
	
	const reply = async () => {
		replying = !(replyError = null);

		const response = await createChildPost($page.params.id, {
			content: replyContent
		});

		replying = false;
		if (!response.success)
			return replyError = response;

		const zero: [{ count: number }] = [{ count: 0 }];
		data.comments = [{
			...response.data,
			likes: zero,
			liked: zero,
			author: data.user!,
			comments: zero
		}, ...data.comments];
		replyContent = '';
	};

	let content: HTMLDivElement;
	onMount(() => {
		if (data.parent)
			content.scrollIntoView({ block: 'center' });
	});
</script>

<div class="main">
	{#if data.parent}
		<ProfilePost
			id={data.parent.id}
			user={data.parent.author}
			likes={data.parent.likes[0].count}
			liked={!!data.parent.liked[0].count}
			content={data.parent.content}
			comments={data.parent.comments[0].count}
			created_at={data.parent.created_at}
			attachments={data.parent.attachments}
		/>
	{/if}
	<div class="content" bind:this={content}>
		<Avatar id={data.author.id} src={data.author.avatar_url} size="sm2" circle/>
		<div>
			<h1>
				<a href={`/user/${data.author.username}`}>
					{data.author.name ?? `@${data.author.username}`}
				</a>
				{#if data.parent}
					{$t('profile_post.replied2')}
					<a href={`/user/${data.parent.author.username}`}>
						{data.parent.author.name ?? `@${data.parent.author.username}`}
					</a>
					{$t('time_ago', [data.created_at])}
				{:else}
					{$t('profile_post.posted', [data.created_at])}
				{/if}
			</h1>
			<Markdown source={data.content}/>
		</div>
	</div>
	{#if data.attachments.length}
		<div class="attachments">
			{#each data.attachments as attachment}
				<div class="item">
					<img src={attachment.url} alt=""/>
				</div>
			{/each}
		</div>
	{/if}

	<div class="details">
		<p>
			<Chat/>{$t('profile_post.comments.count', [data.comments.length])}
		</p>
		<p>
			<Heart/>{$t('profile_post.likes.count', [data.likes[0].count])}
		</p>
	</div>

	{#if data.session}
		<div class="reply">
			<TextInput bind:value={replyContent} multiline placeholder={$t('profile.posts.reply.placeholder')}/>
			<Button on:click={reply} disabled={replying}>
				<Plus/>{$t('profile.posts.reply')}
			</Button>
		</div>
		<RequestError data={replyError} background="var(--background-primary)"/>
	{/if}
	
	{#if data.comments.length}
		<h1>{$t('profile_post.comments')}</h1>
		<div class="comments">
			{#each data.comments as item}
				<ProfilePost
					id={item.id}
					user={item.author}
					likes={item.likes[0].count}
					liked={!!item.liked[0].count}
					content={item.content}
					comments={item.comments[0].count}
					created_at={item.created_at}
					attachments={item.attachments}
				/>
			{/each}
		</div>
	{/if}
</div>

<svelte:head>
	<meta name="og:description" content={data.content}>
	<link type="application/json+oembed" href={`${$page.url.origin}/user/${$page.params.name}/post/${$page.params.id}/oembed.json`}/>
	{#each data.attachments as item}
		<meta name="og:image" content={item.url}/>
		<meta name="twitter:image" content={item.url}/>
		<meta name="twitter:card" content="summary_large_image">
	{/each}
</svelte:head>

<style lang="scss">
	.main {
		width: 640px;
		margin: 48px auto 128px;
		display: flex;
		padding: 0 64px;
		max-width: 640px;
		flex-direction: column;
		.content {
			gap: 20px;
			display: flex;
			padding: 16px 24px 32px;
			background: var(--background-secondary);
			border-radius: 16px;
			&:not(:first-child) {
				margin: 16px 0 0;
			}
			h1 {
				color: var(--color-secondary);
				margin: 20px 0 16px;
				font-size: 1.1em;
				font-weight: 500;
			}
		}
		.attachments {
			gap: 16px;
			width: 100%;
			margin: 16px 0 0;
			display: flex;
			.item {
				flex: 1 0 0;
				width: 0;
				position: relative;
				overflow: hidden;
				box-shadow: 0 8px 16px 0 #00000040;
				border-radius: 16px;
				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
				&:after {
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					content: '';
					display: block;
					position: absolute;
					box-shadow: inset 0 0 0 1px #ffffff40;
					border-radius: inherit;
				}
			}
		}
		.details {
			gap: 16px;
			margin: 32px 0 0;
			display: flex;
			p {
				gap: 8px;
				color: var(--color-secondary);
				margin: 0;
				cursor: pointer;
				display: flex;
				align-items: center;
				&:hover {
					color: var(--color-primary);
				}
			}
		}
		.reply {
			gap: 16px;
			margin: 48px 0 0;
			display: flex;
			:global(.text-input) {
				width: 100%;
			}
		}
		h1 {
			margin: 64px 0 16px;
			font-size: 1.5em;
		}
		.comments {
			gap: 16px;
			display: flex;
			flex-direction: column;
		}
		@media (max-width: 512px) {
			width: 100%;
			padding: 0;
			.content {
				border-radius: 0;
			}
			.attachments {
				gap: 0;
				margin: 0;
				.item {
					border-radius: 0;
					&:after {
						display: none;
					}
				}
			}
			.details, .reply {
				margin: 48px 24px 0;
			}
			h1 {
				margin: 64px 16px 16px;
			}
		}
	}
</style>