<script lang="ts">
	import { Button, TextInput } from '@hakumi/essence';

	import { t } from '$lib/localisation';
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';

	import PersonFill from '$lib/icons/PersonFill.svelte';
	export let data: PageData;
</script>

<div class="header">
	<div class="geist">
		<h1>{$t('settings.profile')}</h1>
		<p>{$t('settings.profile.summary')}</p>
	</div>
</div>
<div class="geist">
	<div class="profile">
		<div class="header">
			<Avatar id={data.session?.sub} src={data.user?.avatar_url} size="md" circle/>
			<div class="name">
				<h1>{data.user?.name ?? data.user?.username}</h1>
				<p>@{data.user?.username}</p>
			</div>
			<div class="buttons">
				<Button href={`/user/${data.user?.username}`}>
					<PersonFill/>{$t('action.view_profile')}
				</Button>
			</div>
		</div>
		<p class="details">{$t('profile.joined', [data.user?.created_at])}</p>
	</div>
</div>

<style lang="scss">
	.profile {
		padding: 16px;
		position: relative;
		margin-top: 64px;
		background: var(--background-secondary);
		border-radius: 36px;
		.header {
			display: flex;
			padding: 0 0 0 128px;
			:global(.avatar) {
				top: -32px;
				left: 24px;
				position: absolute;
				box-shadow: 0 8px 16px 2px #00000040;
			}
			.name {
				h1 {
					margin: 0;
				}
				p {
					color: var(--color-secondary);
					margin: 4px 0 0;
					font-size: .9em;
				}
			}
			.buttons {
				margin-left: auto;
			}
		}
		.details {
			color: var(--color-secondary);
			margin: 32px 8px 4px;
			font-size: .9em;
		}
	}
	.buttons {
		gap: 16px;
		display: flex;
	}
</style>