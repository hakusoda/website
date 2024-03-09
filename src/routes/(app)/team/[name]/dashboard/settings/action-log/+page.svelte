<script lang="ts">
    import ActionLog from '$lib/ui/components/ActionLog.svelte';
    export let data;
</script>

<ActionLog team_id={data.id}/>