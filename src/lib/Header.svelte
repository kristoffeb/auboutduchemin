<script lang="ts">
	import Menu from './components/Menu.svelte';
</script>

<header class="fixed-header">
	<a href="/" class="logo-link">au bout du chemin<br />audioblog / portfolio / recueil d'émois</a>

	<Menu />
</header>

<style>
	.fixed-header {
		position: fixed;
		top: 0;
		right: 0;
		z-index: 50;
		padding: 20px 26px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 12px;
		text-align: right;
	}

	.logo-link {
		display: inline-block;
		font-family: var(--fontBody);
		font-size: 16px;
		font-weight: 500;
		color: var(--accent);
		text-decoration: none;
		line-height: 1.375;
		white-space: pre-line;
		transition: color 400ms var(--motionEase);
	}

	.logo-link:hover {
		color: color-mix(in srgb, var(--accent) 80%, transparent);
	}

	@media (max-width: 860px) {
		.fixed-header {
			padding: 16px 20px;
			gap: 10px;
		}

		.logo-link {
			font-size: clamp(1.01rem, 3.05vw, 1.1rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.logo-link {
			transition: none;
			will-change: auto;
		}
	}
</style>
