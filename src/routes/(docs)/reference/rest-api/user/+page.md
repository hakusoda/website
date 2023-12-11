<script>
	import ApiEndpoint from '$lib/components/ApiEndpoint.svelte';
</script>

<ApiEndpoint
	path="/v1/user/[user]"
	title="Get User"
	method="GET"
	description="Returns the specified user.\nEither a username, or full UUIDv4 (recommended) can be specified."
/>