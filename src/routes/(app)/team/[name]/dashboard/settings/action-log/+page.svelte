<script lang="ts">
    import type { PageData } from './$types';
    
	import ActionLog from '$lib/components/ActionLog.svelte';
    export let data: PageData;
</script>

<ActionLog team_id={data.id}/>