<script>
	import ApiEndpoint from '$lib/ui/components/ApiEndpoint.svelte';
</script>

<ApiEndpoint
	path="/v0/user/[user]"
	title="Get User"
	method="GET"
	description="Returns the specified user.\nEither a username, or full UUID (recommended) can be specified."
/>