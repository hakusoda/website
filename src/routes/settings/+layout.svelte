<script lang="ts">
	import { t } from '$lib/localisation';
	import SettingsNavItem from '$lib/components/SettingsNavItem.svelte';
</script>

<div class="main">
	<div class="nav">
		<p>{$t('settings')}</p>
		<SettingsNavItem id="account" path="/settings/account"/>
	
		<p>{$t('settings.roblox')}</p>
		<SettingsNavItem id="roblox.verification" path="/settings/roblox/verification"/>
	</div>
	<slot/>
</div>

<style lang="scss">
	.main {
		display: flex;
		.nav {
			width: 25%;
			margin: 16px 0 16px 16px;
			display: flex;
			min-width: 25%;
			flex-direction: column;
			p {
				color: var(--color-secondary);
				margin: 32px 16px 8px;
				font-size: .8em;
			}
		}
	}
</style>