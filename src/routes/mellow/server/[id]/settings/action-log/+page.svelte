<script lang="ts">
	import { t } from '$lib/localisation';
    import type { PageData } from './$types';
    
	import ActionLog from '$lib/components/ActionLog.svelte';
    export let data: PageData;
</script>

{#await data.streamed.items then items}
	<ActionLog items={items.map(item => ({
		...item,
		text: $t(`action_log.type.${item.type}`, [item])
	}))}/>
{/await}