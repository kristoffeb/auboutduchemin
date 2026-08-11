<script lang="ts">
	import { page } from '$app/state';

	const isAboutPage = $derived(page.url.pathname === '/about');
</script>

<header class="fixed-header">
	<a href="/" class="logo-link">au bout du chemin<br />audioblog / portfolio / recueil d'émois</a>

	<nav class="header-nav" aria-label="Primary">
		<a href="/about" class="nav-logo-style" class:active={isAboutPage} aria-current={isAboutPage ? 'page' : undefined}
			>à propos</a
		>
	</nav>
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

	.header-nav {
		pointer-events: auto;
	}

	.header-nav a {
		font-family: var(--fontUi);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--accent) 88%, transparent);
		text-decoration: none;
		transition:
			color 220ms var(--motionEase),
			opacity 220ms var(--motionEase);
	}

	.header-nav a:hover,
	.header-nav a.active {
		color: var(--accent);
		opacity: 1;
	}

	.header-nav a.active {
		text-decoration: underline;
		text-decoration-thickness: 1.5px;
		text-decoration-color: var(--linkUnderline);
		text-underline-offset: 0.24em;
	}

	.nav-logo-style {
		font-family: var(--fontBody) !important;
		font-size: 16px !important;
		font-weight: 500 !important;
		letter-spacing: normal !important;
		text-transform: none !important;
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
		.logo-link,
		.header-nav a {
			transition: none;
			will-change: auto;
		}
	}
</style>
