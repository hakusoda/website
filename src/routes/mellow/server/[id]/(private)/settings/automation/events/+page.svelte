<script lang="ts">
	import Portal from 'svelte-portal';

	import { t } from '$lib/ui/localisation/index';
	import { page } from '$app/stores';
	import { clone_json } from '$lib/shared/util';
	import type { Document } from '$lib/shared/types/visual_scripting';
	import { VISUAL_SCRIPTING_ELEMENT_KINDS } from '$lib/client/model/visual_scripting';
	import { update_visual_scripting_document, create_mellow_server_visual_scripting_document } from '$lib/client/api';
	import { create_visual_scripting_element, get_allowed_visual_scripting_element_kinds_for_document } from '$lib/client/model/visual_scripting';

	import Avatar from '$lib/ui/components/Avatar.svelte';
	import ElementList from '$lib/ui/components/visual_scripting/ElementList.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Plus from 'virtual:icons/bi/plus-lg';
	import FloppyFill from 'virtual:icons/bi/floppy-fill';
	import PencilFill from 'virtual:icons/bi/pencil-fill';
	import DocumentIcon from '$lib/ui/icons/Document.svelte';
	import PersonFillAdd from 'virtual:icons/bi/person-fill-add';
	export let data;

	let saving = false;
	let focused_id: string | null = null;
	let item_filter = '';
	let current_document: Document | null = null;
	const save = async () => {
		saving = true;
		if (current_document!.id) {
			const response = await update_visual_scripting_document(current_document!.id, current_document!);
			if (response.success)
				data.documents = data.documents.map(item => item.id === current_document!.id ? clone_json(current_document!) : item), current_document = null;
		} else {
			const response = await create_mellow_server_visual_scripting_document($page.params.id, current_document!);
			if (response.success)
				data.documents = [...data.documents, response.data], current_document = null;
		}

		saving = false
	};
</script>

<div class="header">
	<h2>{$t('mellow.server.settings.automation.events')}</h2>
	<p>{$t('mellow.server.settings.automation.events.summary')}</p>
</div>

<div class="event_blocks">
	{#each [
		'mellow.discord_event.member_join',
		'mellow.discord_event.message_create',
		'mellow.discord_event.member.completed_onboarding',
		'mellow.event.member.synced'
	] as kind}
		{@const document = data.documents.find(item => item.kind === kind)}
		{#if document}
			{@const tree_length = document.definition.length}
			{@const { created_by } = document}
			<div class="item">
				<div class="header">
					{#if document.kind === 'mellow.discord_event.member_join'}
						<PersonFillAdd font-size={24}/>
					{:else}
						<DocumentIcon size={24}/>
					{/if}
					{document.name}
					{#if created_by}
						<a class="creator" href={`/user/${created_by.username}`}>
							<Avatar id={created_by.id} src={created_by.avatar_url} size="xxs" circle/>
							Created by {created_by.name ?? `@${created_by.username}`}
						</a>
					{/if}
					<button type="button" on:click={() => current_document = clone_json(document)}>
						<PencilFill font-size={14}/>{$t('action.edit')}
					</button>
				</div>
				<div class="items">
					{#if tree_length}
						{#each document.definition.slice(0, tree_length === 3 ? 3 : 2) as item}
							<div>
								<svelte:component this={VISUAL_SCRIPTING_ELEMENT_KINDS[item.kind]?.icon}/>
								{$t(`visual_scripting.element.kind.${item.kind}`)}
								{#if item.kind === 'statement.if'}
									(insert condition here)
								{/if}
							</div>
							{#if item.kind === 'statement.if'}
								{#if item.blocks[0]}
									{#each item.blocks[0].items as sub_item}
										<div class="inner">
											<svelte:component this={VISUAL_SCRIPTING_ELEMENT_KINDS[sub_item.kind]?.icon}/>
											{$t(`visual_scripting.element.kind.${sub_item.kind}`)}
										</div>
									{/each}
								{/if}
							{/if}
						{/each}
						{#if tree_length > 3}
							<div class="inner">
								...and {tree_length - 3} more actions...
							</div>
						{/if}
					{:else}
						<div>
							<X/>Do nothing
						</div>
					{/if}
				</div>
			</div>
		{:else}
			{@const name = $t(`visual_scripting.document.kind.${kind}`)}
			<div class="item">
				<div class="header">
					{#if kind === 'mellow.discord_event.member_join'}
						<PersonFillAdd font-size={24}/>
					{:else}
						<DocumentIcon size={24}/>
					{/if}
					{name}
					<button type="button" on:click={() => current_document = {
						id: '',
						kind,
						name,
						created_by: null,
						definition: []
					}}>
						<Plus font-size={14}/>{$t('action.create')}
					</button>
				</div>
			</div>
		{/if}
	{/each}
</div>

{#if current_document}
	{@const allowed_element_kinds = get_allowed_visual_scripting_element_kinds_for_document(current_document)}
	<Portal target="#absolute-solver">
		<div class="event_editor">
			<div class="container">
				<div class="top_bar">
					{#if current_document.kind === 'mellow.discord_event.member_join'}
						<PersonFillAdd font-size={24}/>
					{:else}
						<DocumentIcon size={24}/>
					{/if}
					{current_document.name}
					<button type="button" class="save" on:click={save} disabled={saving}>
						<FloppyFill font-size={14}/>{$t('action.save')}
					</button>
					<button type="button" on:click={() => current_document = null} disabled={saving}>
						<X font-size={14}/>{$t('action.cancel')}
					</button>
				</div>
				<div class="controls">
					<ElementList is_root document={current_document} bind:items={current_document.definition} bind:focused_id/>
					<div class="side_bar">
						<input class="awesome_focus" type="text" placeholder="Search for actions" bind:value={item_filter}/>
						<div class="items">
							{#each allowed_element_kinds.filter(kind => $t(`visual_scripting.element.kind.${kind}`).toLowerCase().includes(item_filter.toLowerCase())) as kind}
								{@const metadata = VISUAL_SCRIPTING_ELEMENT_KINDS[kind]}
								{@const is_comment = kind === 'no_op.comment'}
								<button type="button" class:comment={is_comment} disabled={saving} on:click={() => {
									// i love the svelte language server
									if (current_document)
										current_document.definition = [...current_document.definition, create_visual_scripting_element(kind)];
									focused_id = null;
								}}>
									<div class="icon" style={`--b: ${metadata?.colour};`}>
										<svelte:component this={metadata?.icon} font-size={is_comment ? 16 : 12}/>
									</div>
									{$t(`visual_scripting.element.kind.${kind}`)}
								</button>
							{/each}
						</div>
						<p>{JSON.stringify(current_document, null, 4)}</p>
					</div>
				</div>
			</div>
		</div>
	</Portal>
{/if}

<style lang="scss">
	@keyframes appear1 {
		0% {
			background: none;
		}
	}
	@keyframes appear2 {
		0% {
			transform: translate(-50%, 100%);
		}
	}
	.event_blocks {
		gap: 32px;
		display: flex;
		flex-direction: column;
		.item {
			box-shadow: 0 0 0 1px var(--border-primary);
			border-radius: 16px;
			.header {
				gap: 16px;
				height: 56px;
				display: flex;
				padding: 0 20px;
				background: #0000001a;
				align-items: center;
				&:not(:last-child) {
					border-bottom: 1px solid var(--border-primary);
				}
				&:has(.creator) button {
					margin-left: 8px;
				}
				.creator {
					gap: 12px;
					display: flex;
					font-size: .9em;
					margin-left: auto;
					align-items: center;
				}
				button {
					gap: 12px;
					color: var(--color-primary);
					border: none;
					height: 32px;
					cursor: pointer;
					margin: 0 -6px 0 auto;
					display: flex;
					padding: 0 16px;
					font-size: .75em;
					background: #ffffff0a;
					transition: opacity .5s, background .5s, box-shadow .5s;
					box-shadow: inset 0 0 0 1px #ffffff1a, 0 0 4px 0 #00000060;
					font-family: var(--font-primary);
					align-items: center;
					border-radius: 8px;
					&:disabled {
						opacity: 0.5;
					}
					&:not(:disabled):hover {
						background: #ffffff0c;
						box-shadow: inset 0 0 0 1px #ffffff2a, 0 0 4px 0 #00000060;
					}
				}
			}
			.items {
				display: flex;
				overflow: hidden;
				position: relative;
				flex-direction: column;
				div:not(:last-child) {
					border-bottom: 1px solid var(--border-primary);
				}
				div {
					gap: 16px;
					color: var(--color-secondary);
					height: 40px;
					display: flex;
					padding: 0 24px;
					overflow: hidden;
					font-size: .9em;
					align-items: center;
					&.inner {
						padding-left: 56px;
					}
				}
			}
		}
	}
	.event_editor {
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		position: absolute;
		animation: 1s linear appear1;
		background: #00000080;
		user-select: none;
		-webkit-user-select: none;
		.container {
			left: 50%;
			width: 1200px;
			bottom: 0;
			height: calc(100% - 64px);
			position: absolute;
			max-width: 100vw;
			transform: translateX(-50%);
			animation: .5s ease-out appear2;
			background: var(--background-primary);
			box-shadow: inset 0 0 0 1px var(--border-primary), 0 0 16px 8px #00000040;
			border-radius: 16px 16px 0 0;
			.top_bar {
				gap: 16px;
				display: flex;
				padding: 16px 20px;
				box-shadow: 0 0 32px 1px #00000030;
				align-items: center;
				border-bottom: 1px solid var(--border-primary);
				button {
					gap: 12px;
					color: var(--color-primary);
					border: none;
					height: 32px;
					cursor: pointer;
					margin: 0 -4px 0 0;
					display: flex;
					padding: 0 16px;
					font-size: .75em;
					background: #ffffff0a;
					transition: opacity .5s, background .5s, box-shadow .5s;
					box-shadow: inset 0 0 0 1px #ffffff1a, 0 0 4px 0 #00000060;
					font-family: var(--font-primary);
					align-items: center;
					border-radius: 8px;
					&:disabled {
						opacity: 0.5;
					}
					&:not(:disabled):hover {
						background: #ffffff0c;
						box-shadow: inset 0 0 0 1px #ffffff2a, 0 0 4px 0 #00000060;
					}
					&.save {
						margin: 0 0 0 auto;
						background: var(--button-background);
						box-shadow: inset 0 0 0 1px #ffffff3a, 0 0 4px 0 #00000060;
						&:not(:disabled):hover {
							background: var(--button-background-hover);
							box-shadow: inset 0 0 0 1px #ffffff4a, 0 0 4px 0 #00000060;
						}
					}
				}
			}
			.controls {
				width: 100%;
				height: inherit;
				display: flex;
				overflow: hidden;
				& > :global(.visual_scripting_element_list) {
					flex: 1 0 auto;
					padding: 24px;
					overflow: auto;
				}
				.side_bar {
					width: 256px;
					display: flex;
					overflow: auto;
					box-shadow: 0 0 32px 1px #00000030;
					border-left: 1px solid var(--border-primary);
					flex-direction: column;
					input {
						color: var(--color-primary);
						border: none;
						height: 24px;
						margin: 16px 16px 16px;
						padding: 0 8px;
						background: var(--background-secondary);
						font-family: var(--font-primary);
						border-radius: 4px;
						&::placeholder {
							color: var(--color-secondary);
						}
					}
					.items {
						display: flex;
						padding: 16px;
						background: var(--background-secondary);
						border-top: 1px solid var(--border-primary);
						border-bottom: 1px solid var(--border-primary);
						flex-direction: column;
						button {
							gap: 10px;
							color: var(--color-primary);
							border: none;
							height: 32px;
							cursor: pointer;
							display: flex;
							padding: 0 8px;
							background: var(--background-tertiary);
							align-items: center;
							font-family: var(--font-primary);
							border-radius: 8px;
							&.comment .icon {
								color: hsl(40, 100%, 75%);
							}
							&:nth-child(2n) {
								background: none;
							}
							.icon {
								width: 20px;
								height: 20px;
								display: flex;
								background: var(--b);
								border-radius: 4px;
								& > :global(*) {
									margin: auto;
								}
							}
						}
					}
					p {
						font-size: .5em;
						font-weight: 100;
						white-space: pre;
						user-select: initial;
						font-family: monospace;
						-webkit-user-select: initial;
					}
				}
			}
		}
	}
</style>