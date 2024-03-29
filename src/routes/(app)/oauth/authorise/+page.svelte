<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation/index';
	import { authoriseApplication } from '$lib/client/api';
	import type { ApiRequestError } from '$lib/shared/types';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	import RequestError from '$lib/ui/components/RequestError.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Check from 'virtual:icons/bi/check-lg';
	import Hourglass from 'virtual:icons/bi/hourglass';
	import ThreeDots from 'virtual:icons/bi/three-dots';
	import PersonFill from 'virtual:icons/bi/person-fill';
	import ExclamationOctagonFill from 'virtual:icons/bi/exclamation-octagon-fill';
	export let data;
	
	let error: ApiRequestError | null = null;
	let authorising = false;
	const authorise = async () => {
		authorising = !(error = null);

		const response = await authoriseApplication(data.id, data.redirect_uri);
		if (!response.success)
			return authorising = !(error = response);

		location.href = response.data.redirect_uri;
	};

	$: badRedirect = !data.redirect_uris.includes(data.redirect_uri);
</script>

<div class="oauth-authorise">
	<h1>
		{data.name} is requesting access
	</h1>
	<div class="you-two">
		<div class="entity">
			<Avatar id={data.id} src={data.avatar_url} size="md" hover/>
			<p>{data.name}</p>
			<p class="sub">
				by
				<a href={`/team/${data.owner.name}`} target="_blank">
					{data.owner.display_name}
				</a>
			</p>
		</div>
		{#if badRedirect}
			<X font-size={32}/>
		{:else if authorising}
			<Hourglass font-size={32}/>
		{:else}
			<ThreeDots font-size={32}/>
		{/if}
		<div class="entity">
			<Avatar id={data.session?.sub} src={data.user?.avatar_url} size="md" hover circle/>
			<p>{data.user?.name}</p>
			<p class="sub">@{data.user?.username}</p>
		</div>
	</div>
	{#if badRedirect}
		<p class="error">
			<ExclamationOctagonFill/>The Redirect URI included with this request did not exactly match any of the allowed.
		</p>
	{:else}
		<div class="scopes">
			<div class="item">
				<PersonFill font-size={32}/>
				<div class="details">
					<h1>Your Profile</h1>
					<p>This will allow {data.name} to read your public profile.</p>
				</div>
			</div>
		</div>
		<RequestError data={error}/>

		<p class="redirect">You will be redirected to {new URL(data.redirect_uri).origin}</p>
		<div class="buttons">
			<Button on:click={authorise} disabled={authorising}>
				<Check/>{$t('action.continue')}
			</Button>
			<Button href="/" colour="secondary" disabled={authorising}>
				<X/>{$t('action.cancel')}
			</Button>
		</div>
	{/if}
</div>

<style lang="scss">
	.oauth-authorise {
		margin: 64px;
		display: flex;
		align-items: center;
		flex-direction: column;
		h1 {
			margin: 0 0 32px;
		}
		.you-two {
			gap: 64px;
			color: var(--color-secondary);
			display: flex;
			.entity {
				width: 96px;
				display: flex;
				align-items: center;
				flex-direction: column;
				p {
					width: fit-content;
					color: var(--color-primary);
					margin: 16px 0 0;
					white-space: nowrap;
				}
				.sub {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .8em;
					a {
						color: var(--color-link);
					}
				}
			}
			:global(svg) {
				margin: 32px 0;
			}
		}
		.error {
			gap: 12px;
			color: hsl(0 60% 55%);
			margin: 64px 0 0;
			display: flex;
			font-size: .9em;
			align-items: center;
		}
		.scopes {
			gap: 16px;
			width: 100%;
			margin: 48px 0 0;
			display: flex;
			max-width: 512px;
			flex-direction: column;
			.item {
				height: 64px;
				display: flex;
				padding: 0 28px;
				background: var(--background-secondary);
				align-items: center;
				border-radius: 32px;
				.details {
					margin-left: 24px;
					h1 {
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
			}
		}
		.redirect {
			color: var(--color-secondary);
			margin: 96px 0 16px;
			font-size: .8em;
		}
		.buttons {
			gap: 16px;
			display: flex;
		}
	}
</style>