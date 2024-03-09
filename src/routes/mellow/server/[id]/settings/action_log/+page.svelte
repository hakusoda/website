<script lang="ts">
	import { page } from '$app/stores';
    
	import ActionLog from '$lib/ui/components/ActionLog.svelte';
</script>

<ActionLog server_id={$page.params.id}/>