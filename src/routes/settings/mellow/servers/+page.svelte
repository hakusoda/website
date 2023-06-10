<script lang="ts">
	import type { PageData } from './$types';

	import Avatar from '$lib/components/Avatar.svelte';
	export let data: PageData;
</script>

<div class="main">
	<div class="servers">
		{#each data.servers as item}
			<a class="item" href={`/mellow/server/${item.id}/settings`}>
				<Avatar src={item.avatar_url} size="sm2"/>
				<div class="name">
					<h1>{item.name}</h1>
				</div>
			</a>
		{/each}
	</div>
</div>