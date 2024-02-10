<script lang="ts">
	import Portal from 'svelte-portal';

	import './TeamSelect.scss'
	import { page } from '$app/stores';

	import Avatar from './Avatar.svelte';

	import Search from 'virtual:icons/bi/search';
	import ChevronDown from 'virtual:icons/bi/chevron-down';
	export let value: string | null = null;

	let focus = false;
	let search = '';
	let element: HTMLDivElement;
	let inputElement: HTMLInputElement;

	$: teams = $page.data.user!.teams;
	$: displayTeams = teams
		.filter(item => item.team.display_name?.toLowerCase().includes(search.toLowerCase()) || item.team.name.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => (a.team.display_name ?? a.team.name).localeCompare(b.team.display_name ?? b.team.name));
	$: team = teams.find(item => item.team.id === value);

	$: rect = (focus ? element : element)?.getBoundingClientRect();
	$: if (focus && value)
		value = null, search = '';
</script>

<div class="team-select" bind:this={element}>
	{#if team}
		<Avatar id={team.team.id} src={team.team.avatar_url} size="xxxs"/>
	{:else}
		<Search/>
	{/if}
	<input
		type="text"
		class="focusable"
		placeholder="Select a Team"
		bind:this={inputElement}
		bind:value={search}
		on:blur={() => requestAnimationFrame(() => focus = false)}
		on:focus={() => requestAnimationFrame(() => focus = true)}
		on:keypress={event => {
			if (event.key === 'Enter') {
				const item = displayTeams[0];
				focus = false, value = item?.team.id ?? null, search = item.team.display_name ?? item.team.name, inputElement.blur();
			}
		}}
	/>
	<ChevronDown/>
</div>

{#if focus}
	<Portal target="#absolute-solver">
		<div class="menu-content show" style={`top: ${rect.top + rect.height - 1}px; left: ${rect.left}px; width: ${rect.width}px; max-height: calc(100vh - ${rect.top + rect.height + 64}px);`}>
			{#each displayTeams as item}
				<button type="button" on:mousedown={() => (focus = false, value = item.team.id, search = item.team.display_name ?? item.team.name)}>
					<Avatar src={item.team.avatar_url} size="xxs"/>
					{item.team.display_name ?? item.team.name}
				</button>
			{/each}
		</div>
	</Portal>
{/if}

<style lang="scss">
	.team-select {
		height: 40px;
		position: relative;
		transition: box-shadow 0.5s;
		box-shadow: inset 0 0 0 1px var(--border-primary);
		border-radius: 20px;
		&:hover, &:has(input:focus) {
			box-shadow: inset 0 0 0 1px var(--border-secondary);
		}
		&:has(input:focus) {
			background: center / 200px repeat, var(--grain);
			border-radius: 20px 20px 0 0;
		}

		input {
			width: -moz-available;
			width: -webkit-fill-available;
			color: var(--color-primary);
			height: 100%;
			border: none;
			padding: 0 24px 0 52px;
			font-size: .9em;
			background: none;
			border-radius: inherit; // for the "focusable" thing
			&::placeholder {
				color: var(--color-secondary);
			}
		}
	}
	.menu-content {
		position: absolute;
		border-radius: 0 0 16px 16px;
	}
</style>