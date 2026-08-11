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
		z-index: 70;
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

	@media (max-width: 600px) {
		.fixed-header {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			width: 100%;
			padding: 12px 16px;
			gap: 8px;
			background-color: var(--paper);
			background-image:
				radial-gradient(
					circle at 12% 14%,
					color-mix(in srgb, var(--accent) 12%, transparent),
					transparent 46%
				),
				radial-gradient(
					circle at 88% 10%,
					color-mix(in srgb, var(--ink) 8%, transparent),
					transparent 34%
				);
			background-attachment: fixed;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.logo-link {
			font-size: 13px;
			line-height: 1.3;
			flex: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.logo-link {
			transition: none;
			will-change: auto;
		}
	}
</style>
