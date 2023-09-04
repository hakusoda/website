<div class="main">
	<div class="nav">
		<div class="lazy"/>
		<slot name="nav"/>
	</div>
	<slot/>
</div>

<style lang="scss">
	.main {
		width: 100%;
		display: flex;
		min-height: calc(100svh - 58px);
		.nav {
			width: 25%;
			display: flex;
			padding: 16px 0 16px 16px;
			position: relative;
			min-width: 25%;
			background: #00000040;
			flex-direction: column;
			& > :global(p) {
				color: var(--color-primary);
				margin: 32px 16px 8px;
				font-size: 13px;
				font-weight: 500;
			}
			.lazy {
				top: -58px;
				left: 0;
				width: 100%;
				height: 58px;
				position: absolute;
				background: #00000040;
			}
		}
	}
</style>