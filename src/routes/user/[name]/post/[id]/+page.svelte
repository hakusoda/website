<script lang="ts">
	import { Button, TextInput } from '@voxelified/voxeliface';

	import { t } from '$lib/localisation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import { createChildPost } from '$lib/api';
	import type { ApiRequestError, CreateUserPostPayload } from '$lib/types';

	import Avatar from '$lib/components/Avatar.svelte';
	import Markdown from '$lib/components/Markdown.svelte';
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

		const response = await createChildPost(data.session!.access_token, $page.params.id, {
			content: replyContent
		});

		replying = false;
		if (!response.success)
			return replyError = response;

		const zero: [{ count: number }] = [{ count: 0 }];
		data.comments = [{
			...response.data,
			likes: zero,
			author: data.user!,
			comments: zero
		}, ...data.comments];
		replyContent = '';
	};
</script>

<div class="main">
	<div class="content">
		<Avatar id={data.author.id} src={data.author.avatar_url} size="sm2" hover circle/>
		<div>
			<h1>
				<a href={`/user/${data.author.username}`}>{data.author.name ?? `@${data.author.username}`}</a>
				{$t('profile_post.posted', [data.created_at])}
			</h1>
			<Markdown source={data.content}/>
		</div>
	</div>

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
				<a class="item" href={`/user/${data.author.username}/post/${item.id}`}>
					<div class="header">
						<Avatar id={item.author.id} src={item.author.avatar_url} size="xs" circle/>
						<p class="author">
							<a href={`/user/${item.author.username}`}>
								{item.author.name ?? `@${item.author.username}`}
							</a>
							{$t('profile_post.replied', [item.created_at])}
						</p>
					</div>
					<Markdown source={item.content}/>
					<div class="details">
						<p>
							<Chat/>{$t('number', [item.comments[0].count])}
						</p>
						<p>
							<Heart/>{$t('number', [item.likes[0].count])}
						</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>

<style lang="scss">
	.main {
		margin: 48px 64px 64px;
		.content {
			gap: 24px;
			display: flex;
			h1 {
				color: var(--color-secondary);
				margin: 20px 0 24px;
				font-size: 1.25em;
				font-weight: 500;
			}
		}
		.details {
			gap: 16px;
			margin: 48px 0 0;
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
			.item {
				padding: 16px;
				background: var(--background-secondary);
				border-radius: 16px;
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
			}
		}
	}
</style>