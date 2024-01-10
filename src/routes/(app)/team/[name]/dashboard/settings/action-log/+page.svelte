<script lang="ts">
    import ActionLog from '$lib/components/ActionLog.svelte';
    export let data;
</script>

<ActionLog team_id={data.id}/>