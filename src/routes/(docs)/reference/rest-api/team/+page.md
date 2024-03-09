<script>
	import ApiEndpoint from '$lib/ui/components/ApiEndpoint.svelte';
</script>

<ApiEndpoint
	path="/v0/team/[team]"
	title="Get Team"
	method="GET"
	description="Returns the specified team.\nEither a name, or full (recommended) can be specified."
/>