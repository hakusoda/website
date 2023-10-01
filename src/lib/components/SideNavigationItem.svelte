<script lang="ts">
	import { t } from '../localisation';
	import { page } from '$app/stores';
	export let id: string;
	export let path: string;
	export let footer = false;

	$: active = $page.url.pathname === path;
</script>

<a href={path} class:active class:footer>
	<slot/>
	{$t(id)}
</a>

<style lang="scss">
	a {
		gap: 12px;
		color: hsl(250 20% 90% / 80%);
		display: flex;
		padding: 8px 16px;
		font-size: 13px;
		transition: color .1s;
		align-items: center;
		border-radius: 8px;
		text-decoration: none;
		&.active, &:hover {
			color: var(--menu-color-hover);
			text-decoration: none;
		}
		&.footer {
			margin-top: auto;
		}
	}
</style>