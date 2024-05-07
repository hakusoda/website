<script lang="ts">
	import { ContextMenu } from '@hakumi/essence';
	import type { SvelteComponent } from 'svelte';

	import { t } from '$lib/ui/localisation';
	import type { Variable } from '$lib/client/types/visual_scripting';
	import { VISUAL_SCRIPTING_ELEMENT_KINDS } from '$lib/client/model/visual_scripting';
	import type { Element, Document, StatementInput, VariableReference } from '$lib/shared/types/visual_scripting';
	import { calculate_visual_scripting_element_size, determine_visual_scripting_document_variables, get_applicable_conditions_for_visual_scripting_variable } from '$lib/client/model/visual_scripting';

	import ElementList from './ElementList.svelte';

	import X from 'virtual:icons/bi/x-lg';
	import Question from 'virtual:icons/bi/question-lg';
	export let item: Element;
	export let items: Element[];
	export let document: Document;
	export let position: number;
	export let focused_id: string | null = null;
	export let dragging_id: string | null = null;
	export let drag_position: number | null = null;
	export let dragging_size = 52;

	let element: HTMLButtonElement;
	let textarea_element: HTMLTextAreaElement;
	let option_input_elements: HTMLInputElement[] = [];

	let selected_condition = 0;
	$: if (focused_id === item.id && !option_input_elements.some(item => item === window.document.activeElement))
		requestAnimationFrame(() => (textarea_element ?? element).focus());

	$: size = calculate_visual_scripting_element_size(item, dragging_id);
	$: is_being_dragged = item.id === dragging_id;
	$: metadata = VISUAL_SCRIPTING_ELEMENT_KINDS[item.kind];
	$: is_comment = item.kind === 'no_op.comment';
	$: drag_inside = !is_being_dragged && drag_position !== null && item.kind === 'statement.if' && !item.blocks[0].items.length && drag_position >= position + 52 && drag_position <= position + size - 52;
	$: root_variable = determine_visual_scripting_document_variables(document, item.id);

	let input_one_trigger: () => void;
	let condition_trigger: () => void;
	function get_variables_by_path(variable: Variable, path: string[] = []): Variable[] {
		if (variable.kind === 'generic.map') {
			const item_name = path[0];
			if (!item_name)
				return [variable];

			const sub_variable = variable.definition[item_name];
			if (!sub_variable)
				return [];
			return [variable, ...get_variables_by_path(sub_variable, path.slice(1))];
		}
		return [variable];
	}
	function compute_variable_reference(reference: VariableReference): [string, typeof SvelteComponent<any>?] {
		const variables = get_variables_by_path(root_variable, reference.path.split('::')).slice(1);
		return [variables.map(item => {
			if (item.translation_key)
				return $t(`visual_scripting.variable.${item.translation_key as ''}`);
			return JSON.stringify(item);
		}).join(' > '), variables.length === 1 ? variables[0]?.display_icon : undefined];
	}
	function compute_input_display(input: StatementInput): [string, typeof SvelteComponent<any>?] {
		if (input.kind === 'variable')
			return compute_variable_reference(input.value);
		return ['cannot compute'];
	}
</script>

<button class="visual_scripting_element" type="button" bind:this={element} class:drag={drag_position !== null} class:top_margin={!is_being_dragged && drag_position !== null && drag_position <= position + 28 && drag_position >= position - dragging_size / 2} class:comment={is_comment} class:inner_margin={drag_inside} style={`--m: ${dragging_size + 24}px;`} on:focusin|trusted={() => focused_id = item.id} on:focusout|trusted={() => { if (drag_position === null) focused_id = null; }}>
	<div class="upper">
		<div class="icon" style={`--b: ${metadata?.colour ?? '#000'};`}>
			{#if metadata}
				<svelte:component this={metadata?.icon} font-size={metadata?.colour === 'none' ? 20 : 16}/>
			{:else}
				<Question/>
			{/if}
		</div>
		{#if item.kind === 'action.mellow.member.roles.assign'}
			Assign
			<input class="option awesome_focus" type="text" bind:this={option_input_elements[0]} bind:value={item.value} placeholder="Role" class:active={!!item.value}/>
			to
			<button class="option" type="button" on:click={input_one_trigger} class:active={!!item}>
				{#if item}
					{@const [text, icon] = compute_variable_reference(item.reference)}
					<svelte:component this={icon}/>
					{text}
				{:else}
					Member
				{/if}
			</button>
		{:else if item.kind === 'action.mellow.message.reaction.create'}
			Add
			<input class="option awesome_focus" type="text" bind:this={option_input_elements[0]} bind:value={item.value} placeholder="Emoji" class:active={!!item.value}/>
			to
			<button class="option" type="button" on:click={input_one_trigger} class:active={!!item}>
				{#if item.reference.path}
					{@const [text, icon] = compute_variable_reference(item.reference)}
					<svelte:component this={icon}/>
					{text}
				{:else}
					Message
				{/if}
			</button>
		{:else}
			{$t(`visual_scripting.element.kind.${item.kind}`)}
		{/if}
		{#if item.kind === 'statement.if'}
			{@const [block] = item.blocks}
			{#each block.conditions as condition}
				{@const inner_condition = condition.condition}
				{@const condition_kind = inner_condition?.kind}
				{@const input_one = condition.inputs[0]}
				{@const input_two = condition.inputs[1]}
				{@const input_one_variable = get_variables_by_path(root_variable, input_one?.value.path.split('::')).reverse()[0]}
				<button class="option" type="button" on:click={input_one_trigger} class:active={!!input_one}>
					{#if input_one}
						{@const [text, icon] = compute_input_display(input_one)}
						<svelte:component this={icon}/>
						{text}
					{:else}
						Input
					{/if}
				</button>

				<button class="option" type="button" on:click={condition_trigger} class:active={!!condition} class:error={condition && !input_one}>
					{#if inner_condition}
						{$t(`visual_scripting.condition.kind.${condition_kind}`)}
					{:else}
						Condition
					{/if}
				</button>
				<ContextMenu.Root bind:trigger={condition_trigger}>
					{#each get_applicable_conditions_for_visual_scripting_variable(input_one_variable) as kind}
						<button type="button" on:click={() => condition.condition = { kind }}>
							{$t(`visual_scripting.condition.kind.${kind}`)}
						</button>
					{/each}
				</ContextMenu.Root>

				{#if input_one && inner_condition && condition_kind !== 'iterable.has_any_value' && condition_kind !== 'iterable.does_not_have_any_value'}
					{#if input_one_variable?.kind === 'generic.string' && input_two}
						<input class="option awesome_focus" type="text" bind:this={option_input_elements[0]} bind:value={condition.inputs[1].value} placeholder="Text" class:active={!!input_two.value}/>
					{:else}
						<button class="option" class:active={!!input_two}>
							{#if input_two}
								{input_two.value}
							{:else}
								{typeof input_one.value}
							{/if}
						</button>
					{/if}
				{/if}
			{/each}
		{/if}
		<button class="delete" type="button" on:click={() => console.log(items = items.filter(i => i !== item))}>
			<X font-size={14}/>
		</button>
	</div>
	{#if item.kind === 'no_op.comment'}
		<div class="lower">
			<textarea class="awesome_focus" bind:this={textarea_element} bind:value={item.text} placeholder="Enter comment..." on:focusin|trusted={() => focused_id = item.id} on:focusout|trusted={() => { if (drag_position !== null) focused_id = null; }}/>
		</div>
	{/if}
</button>
{#if item.kind === 'statement.if'}
	<ElementList bind:items={item.blocks[0].items} position={position + 80} bind:focused_id {document} {dragging_id} {drag_position}/>
	<div class="visual_scripting_element">
		<div class="icon" style={`--b: ${metadata.colour};`}>
			<svelte:component this={metadata.icon} font-size={16}/>
		</div>
		End if
	</div>
{/if}

<ContextMenu.Root bind:trigger={input_one_trigger}>
	<p>Variables</p>
	{#each Object.entries(root_variable.definition) as [name, variable]}
		{#if variable.kind === 'generic.map'}
			{#if item.kind === 'statement.if'}
				<ContextMenu.Sub>
					<svelte:fragment slot="trigger">
						<svelte:component this={variable.display_icon}/>
						{$t(`visual_scripting.variable.${variable.translation_key}`)}
					</svelte:fragment>
					{#each Object.entries(variable.definition) as [sub_name, sub_variable]}
						<button type="button" on:click={() => {
							if (item.kind === 'statement.if') {
								item.blocks[0].conditions[selected_condition].inputs = [
									{ kind: 'variable', value: { path: `${name}::${sub_name}` } },
									{ kind: 'match', value: '' }
								];
							}
						}}>
							<svelte:component this={sub_variable.display_icon}/>
							{$t(`visual_scripting.variable.${sub_variable.translation_key}`)}
						</button>
					{/each}
				</ContextMenu.Sub>
			{:else}
				<button type="button" on:click={() => {
					if (item.kind === 'action.mellow.member.roles.assign' || item.kind === 'action.mellow.message.reply' || item.kind === 'action.mellow.message.reaction.create')
						item.reference.path = name;
				}}>
					<svelte:component this={variable.display_icon}/>
					{$t(`visual_scripting.variable.${variable.translation_key}`)}
				</button>
			{/if}
		{/if}
	{/each}
</ContextMenu.Root>

<style lang="scss">
	.visual_scripting_element {
		all: unset;
		width: inherit;
		display: flex;
		font-size: .9em;
		max-width: 100%;
		box-sizing: border-box;
		box-shadow: 0 0 8px 0 #00000030;
		background: var(--background-secondary);
		font-weight: 450;
		border-radius: 18px;
		flex-direction: column;
		&:focus, &:has(input:focus), &:has(textarea:focus) {
			box-shadow: 0 0 0 2px hsl(260, 80%, 80%), 0 0 8px 0 #00000030;
		}
		&.drag {
			transition: margin .5s;
		}
		&.comment {
			color: hsl(40, 100%, 90%);
			background: hsl(40, 15%, 35%);
			.upper .icon {
				background: none;
			}
			.lower textarea {
				background: var(--background-secondary);
			}
		}
		&.top_margin {
			margin-top: var(--m);
		}
		&.inner_margin {
			margin-bottom: 56px;
		}
		.upper, &:not(:has(.upper)) {
			display: flex;
			padding: 10px;
			align-items: center;
			flex-direction: row;
			.icon {
				width: 32px;
				height: 32px;
				display: flex;
				background: var(--b);
				margin-right: 16px;
				border-radius: 8px;
				& > :global(*) {
					margin: auto;
				}
			}
			.option {
				--c: hsl(260, 80%, 80%);
				gap: 6px;
				width: fit-content;
				color: hsl(40, 100%, 90%);
				border: none;
				height: 20px;
				margin: 0 4px;
				display: flex;
				padding: 0 8px;
				font-size: .85em;
				background: hsl(40, 15%, 35%);
				font-weight: 300;
				align-items: center;
				border-radius: 8px;
				&:is(button) {
					cursor: pointer;
				}
				&.active {
					color: var(--c);
					background: color-mix(in srgb, var(--c), transparent 85%);
					font-weight: 500;
				}
				&.error {
					--c: #ff3b31;
				}
				&:first-of-type {
					margin-left: 8px;
				}
				&::placeholder {
					color: hsl(40, 100%, 90%);
					&.active {
						color: var(--c);
					}
				}
			}
			.delete {
				all: unset;
				color: var(--color-tertiary);
				cursor: pointer;
				margin: 0 8px 0 auto;
				display: none;
			}
			&:hover .delete {
				display: block;
			}
		}
		.lower {
			display: flex;
			padding: 0 58px 16px;
			textarea {
				color: var(--color-primary);
				width: -webkit-fill-available;
				border: none;
				resize: none;
				outline: none;
				padding: 4px 8px;
				font-size: .8em;
				max-width: -webkit-fill-available;
				min-height: 52px;
				background: var(--background-tertiary);
				font-family: var(--font-primary);
				border-radius: 4px;
				&::placeholder {
					color: var(--color-secondary);
				}
			}
		}
	}
</style>