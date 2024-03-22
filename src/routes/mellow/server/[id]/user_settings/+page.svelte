<script lang="ts">
	import { Button } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import type { UserConnectionType } from '$lib/shared/enums';
	import { clone_json, getUserConnectionUrl } from '$lib/shared/util';
	import { update_mellow_user_server_settings } from '$lib/client/api';

	import Modal from '$lib/ui/components/Modal.svelte';
	import Avatar from '$lib/ui/components/Avatar.svelte';
	import UnsavedChanges from '$lib/ui/modals/UnsavedChanges.svelte';
	import UserSettingsConnection from '$lib/ui/components/mellow/UserSettingsConnection.svelte';

	import HandThumbsUpFill from 'virtual:icons/bi/hand-thumbs-up-fill';
	export let data;

	$: as_new_member = $page.url.searchParams.get('as_new_member') === '';
	$: user_connections = data.user_connections;
	$: original_server_user_connections = data.server_user_connections.filter(item => user_connections.some(i => i.id === item.id));
	$: server_user_connections = clone_json(original_server_user_connections);
	$: recommended = data.recommended_user_connection_kinds.filter(kind => !server_user_connections.some(item => user_connections.find(i => i.id === item.id)?.type === kind));

	let saving = false;
	let adding_connection = false;
	const save_changes = async () => {
		saving = true;
		const filtered_connections = server_user_connections.filter(item => user_connections.some(i => i.id === item.id));
		const response = await update_mellow_user_server_settings($page.params.id, {
			user_connections: filtered_connections
		});
		if (response.success)
			original_server_user_connections = clone_json(filtered_connections);
		saving = false;
	};
	const add_connection = (connection_kind: UserConnectionType, override_id?: string) => {
		adding_connection = true;

		const new_window = window.open(getUserConnectionUrl(connection_kind) + `&state=mellow_user_settings`, 'mellow_user_settings', {
			popup: true,
			innerWidth: 800,
			innerHeight: 600
		} as any);
		if (new_window) {
			const abort_controller = new AbortController();
			const interval_id = setInterval(() => {
				if (new_window.closed)
					clearInterval(interval_id), abort_controller.abort(), adding_connection = false;
			}, 1000);

			window.addEventListener('message', event => {
				const new_item = event.data;
				if (event.origin !== $page.url.origin || !new_item.sub || !new_item.user_id)
					return;

				if (!user_connections.some(item => item.id === new_item.id))
					user_connections = [...user_connections, new_item];

				requestAnimationFrame(() => {
					if (override_id)
						server_user_connections = server_user_connections.map(item => item.id === override_id ? { id: new_item.id } : item);
					else
						server_user_connections = [...server_user_connections, { id: new_item.id }];
				});

				clearInterval(interval_id);
				new_window.close();
				abort_controller.abort();
				adding_connection = false;
			}, { signal: abort_controller.signal });
		}
	};
	const set_connection = (id: string, override_id?: string) => {
		if (override_id)
			server_user_connections = server_user_connections.map(item => item.id === override_id ? { id } : item)
		else
			server_user_connections = [...server_user_connections, { id }];
	};
	const remove_connection = (id: string) =>
		server_user_connections = server_user_connections.filter(item => item.id !== id);
</script>

{#if !as_new_member}
	<div class="header">
		<div class="geist">
			<h1>{$t('navigation.mellow.server.user_settings')}</h1>
			<p>This is where you can adjust what user connections <b>{data.name}</b> can read for syncing your profile.</p>
		</div>
	</div>
{/if}

<div class="user_settings geist">
	{#if as_new_member}
		<div class="welcome" style={`--i: url("${data.banner_url || data.avatar_url}")`} class:blur={!data.banner_url}>
			<Avatar src={data.avatar_url}/>
			<div class="details">
				<h1>Welcome to {data.name}!</h1>
				<p>
					This server utilises mellow to give members special roles and whatnot, using <i>non-sensitive</i> profile information from external platforms, like Roblox!<br/>
					Review the section below to get started, it shouldn't take long! ＼(٥⁀▽⁀ )／
				</p>
			</div>
		</div>
		<div class="separator"/>
	{/if}

	{#if server_user_connections.length}
		<p class="list_title">{$t('mellow.server.user_settings.connections.connected')}</p>
		<p class="list_summary">{$t('mellow.server.user_settings.connections.connected.summary', [data.name])}</p>
		<div class="connection_list">
			{#each server_user_connections as connection}
				<UserSettingsConnection
					current={user_connections.find(item => item.id === connection.id)}
					disabled={saving || adding_connection}
					{add_connection} {set_connection} {user_connections} {remove_connection}
				/>
			{/each}
		</div>
	{/if}

	{#if recommended.length}
		{#if server_user_connections.length}
			<div class="separator"/>
		{/if}

		<p class="list_title">{$t('mellow.server.user_settings.connections.recommended')}</p>
		<p class="list_summary">{$t('mellow.server.user_settings.connections.recommended.summary', [data.name])}</p>
		<div class="connection_list">
			{#each recommended as kind}
				<UserSettingsConnection disabled={saving || adding_connection} {kind} {add_connection} {set_connection} {user_connections} {remove_connection}/>
			{/each}
		</div>
	{/if}

	{#if data.required_user_connection_kinds.length}
		{#if recommended.length || server_user_connections.length}
			<div class="separator"/>
		{/if}

		<p class="list_title">{$t('mellow.server.user_settings.connections.required')}</p>
		<p class="list_summary">{$t('mellow.server.user_settings.connections.required.summary', [data.name])}</p>
		<div class="connection_list">
			{#each data.required_user_connection_kinds as kind}
				<UserSettingsConnection disabled={saving || adding_connection} {kind} {add_connection} {set_connection} {user_connections} {remove_connection}/>
			{/each}
		</div>
	{/if}
</div>

<UnsavedChanges
	save={save_changes}
	show={JSON.stringify(original_server_user_connections) !== JSON.stringify(server_user_connections)}
	reset={() => server_user_connections = clone_json(original_server_user_connections)}
	{saving}
/>

{#if as_new_member && data.skip_onboarding_to !== null && server_user_connections.length > 0}
	<Modal autoOpen>
		<h1>You're all set!</h1>
		<p class="modal-p">You may now close this page and return to Discord, but you may choose to review your settings for this server if need-be.</p>
		<form method="dialog">
			<Button>
				<HandThumbsUpFill/>{$t('action.acknowledge')}
			</Button>
		</form>
	</Modal>
{/if}

<style lang="scss">
	p.modal-p {
		line-height: normal;
		margin-bottom: 24px;
	}
	.user_settings.geist {
		width: 1000px;
		margin: 48px auto 0;
		.welcome {
			margin: 0 -16px 0;
			display: flex;
			padding: 24px;
			align-items: center;
			border-radius: 32px;
			background-size: cover;
			background-image: var(--i);
			background-position: center;
			&.blur {
				/* temporary */
				background-position: unset;
			}
			.details {
				margin-left: 32px;
				h1 {
					margin: 0;
					font-weight: 800;
				}
				p {
					color: var(--color-secondary);
					margin: 8px 0 0;
					font-size: .9em;
				}
			}
		}
		.list_title {
			margin: 0;
			font-size: 1.1em;
			font-weight: 550;
		}
		.list_summary {
			color: var(--color-secondary);
			margin: 8px 0 16px;
			font-size: .8em;
		}
		.separator {
			width: 100%;
			height: 1px;
			margin: 32px 0;
			background: var(--border-primary);
		}
		.connection_list {
			gap: 16px;
			display: flex;
			flex-direction: column;
		}
	}
</style>