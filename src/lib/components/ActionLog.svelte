<script lang="ts">
	import { onMount } from 'svelte';

	import { t } from '../localisation';
	import type { ActionLogItem, ApiRequestError } from '../types';
	import { getTeamActionLog, getMellowServerActionLog } from '../api';
	
	import RequestError from './RequestError.svelte';
	import ActionLogUIItem from './ActionLogItem.svelte';

	import Hourglass from '../icons/Hourglass.svelte';
	export let team_id: string | null = null;
	export let server_id: string | null = null;
	$: items = server_id ? [] : [] as ActionLogItem[];

	$: i = items.reduce((items, value) => {
		const key = new Date(value.created_at).toLocaleString(undefined, { year: 'numeric', month: 'long' });
		return {
			...items,
			[key]: [
				...items[key] ?? [],
				value
			]
		};
	}, {} as Record<string, typeof items>);

	let error: ApiRequestError | null = null;
	let limit = 100;
	let offset = -limit;
	let finished = false;
	let requesting = false;

	let intersect: HTMLDivElement;
	onMount(() => {
		const observer = new IntersectionObserver(async (entries, observer) => {
			if (entries[0]?.intersectionRatio && !requesting) {
				requesting = true;

				const response = await (team_id ? getTeamActionLog : getMellowServerActionLog)(team_id ?? server_id!, limit, offset += limit);
				requesting = false;

				if (response.success) {
					if (!response.data.results.length)
						return observer.disconnect(), finished = true;
					items = [...items, ...response.data.results];

					if (offset + limit >= response.data.total_results)
						return observer.disconnect(), finished = true;
				} else
					error = response, finished = true, observer.disconnect();
			}
		});
		observer.observe(intersect);

		return () => observer.disconnect();
	});
</script>

<div class="audit-log-list">
	{#each Object.entries(i) as [period, items]}
		<h3>{period}</h3>
		{#each items as item}
			<ActionLogUIItem data={item}/>
		{/each}
	{/each}
	{#if requesting}
		<Hourglass size={32}/>
	{/if}
	<RequestError data={error} background="var(--background-primary)"/>
	{#if finished && !error}
		<p class="finished">{$t('label.copyrighted_joke')}</p>
	{/if}
	<div class="intersect" bind:this={intersect}/>
</div>

<style lang="scss">
	.audit-log-list {
		gap: 24px;
		display: flex;
		position: relative;
		flex-direction: column;
		h3 {
			margin: 0;
			font-weight: 600;
			&:not(:first-child) {
				margin-top: 32px;
			}
		}
		.finished {
			color: var(--color-secondary);
			margin: 0 auto 64px;
			font-size: .9em;
		}
		.intersect {
			left: 0;
			width: 100%;
			bottom: 0;
			height: 512px;
			content: '';
			position: absolute;
			pointer-events: none;
		}
	}
</style>