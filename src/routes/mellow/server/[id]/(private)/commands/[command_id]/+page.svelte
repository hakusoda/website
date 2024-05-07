<script lang="ts">
	import { TextInput } from '@hakumi/essence';

	import { t } from '$lib/ui/localisation';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { parse_update_payload } from '$lib/client/util';
	import { editor, set_editor_callback } from '$lib/client/store';
	import { create_mellow_command, update_mellow_command } from '$lib/client/api';

	import WithSideNavigation from '$lib/ui/layouts/WithSideNavigation.svelte';

	import Plus from 'virtual:icons/bi/plus-lg';
	import Document from '$lib/ui/icons/Document.svelte';
	export let data;

	$: current_item = data.commands.find(item => item.id === $page.params.command_id);

	const clone_id = $page.url.searchParams.get('clone_from_id');
	const to_clone = clone_id ? data.commands.find(item => item.id === clone_id) : undefined;

	let name = '';
	let kind = 'slash_command' as const;
	let description = '';
	const reset = () => (name = current_item!.name, description = current_item!.description);
	const reset2 = () => (
		name = to_clone?.name ?? '',
		description = to_clone?.description ?? ''
	);
	$: if (current_item)
		reset();
	else
		reset2();

	$: editor.canSave.set(!current_item || name !== current_item.name);
	set_editor_callback(async () => {
		const payload = {
			name,
			kind,
			description
		};
		const response = current_item ? await update_mellow_command($page.params.id, current_item.id, parse_update_payload(current_item, payload))
			: await create_mellow_command($page.params.id, payload);
		if (response.success) {
			if (current_item)
				data.commands = data.commands.map(i => i.id === current_item!.id ? response.data : i);
			else {
				data.commands = [...data.commands, response.data];
				await goto(`/mellow/server/${$page.params.id}/commands/${response.data.id}`);
			}
		}
	});

	$: navigation_items = [
		[`/mellow/server/${$page.params.id}/commands/create`, Plus, $t('action.create_new')],
		'space',
		...data.commands.map(item => [`/mellow/server/${$page.params.id}/commands/${item.id}`, Document, item.name])
	] as any[];
</script>

<WithSideNavigation items={navigation_items}>
	<div class="command_editor">
		<div class="side">
			<p class="input-label">Command name</p>
			<TextInput bind:value={name} placeholder={$t('label.required')}/>
			<p class="input-label">Command description</p>
			<TextInput bind:value={description} placeholder={$t('label.required')}/>
		</div>
	</div>
</WithSideNavigation>

<style lang="scss">
	.command_editor {
		gap: 32px;
		display: flex;
		.side {
			flex: 1 1 auto;
		}
	}
</style>