<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = false;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}

	onMount(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeMenu();
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	});
</script>

<button
	class="menu-button"
	aria-label="Toggle navigation menu"
	aria-expanded={isOpen}
	on:click={toggleMenu}
	title="Menu"
>
	<svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg" class="menu-icon">
		<!-- Top ornamental curve -->
		<path
			d="M8 8 Q30 2 52 8"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<!-- Center decorative element -->
		<g class="center-element">
			<path
				d="M12 20 Q30 14 48 20"
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path
				d="M28 16 L32 24 M32 16 L28 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</g>
		<!-- Bottom ornamental curve -->
		<path
			d="M8 32 Q30 38 52 32"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</button>

{#if isOpen}
	<div class="menu-overlay" on:click={closeMenu}>
		<div class="menu-panel" on:click|stopPropagation>
			<button class="menu-close" aria-label="Close menu" on:click={closeMenu}>
				<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="close-icon">
					<path
						d="M3 3 L21 21 M21 3 L3 21"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>

			<nav class="menu-nav">
				<a href="/about" class="menu-link" on:click={closeMenu}>à propos</a>
			</nav>
		</div>
	</div>
{/if}

<style>
	.menu-button {
		position: relative;
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		transition: opacity 220ms var(--motionEase);
	}

	.menu-button:hover {
		opacity: 0.8;
	}

	.menu-icon {
		width: 28px;
		height: 20px;
		transition:
			transform 300ms cubic-bezier(0.35, 0.46, 0.15, 0.94),
			opacity 300ms var(--motionEase);
	}

	.center-element {
		transform-origin: 30px 20px;
		transition: transform 300ms cubic-bezier(0.35, 0.46, 0.15, 0.94);
	}

	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: white;
		z-index: 40;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: overlayFadeIn 300ms var(--motionEase) forwards;
	}

	@keyframes overlayFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.menu-panel {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 60px 20px 20px;
		animation: panelScaleIn 400ms cubic-bezier(0.35, 0.46, 0.15, 0.94) forwards;
	}

	@keyframes panelScaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.menu-close {
		position: absolute;
		top: 24px;
		right: 24px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		transition: transform 300ms var(--motionEase);
		z-index: 41;
	}

	.menu-close:hover {
		transform: rotate(90deg);
	}

	.close-icon {
		width: 24px;
		height: 24px;
	}

	.menu-nav {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0;
	}

	.menu-link {
		font-family: var(--fontBody);
		font-size: clamp(3rem, 8vw, 5.5rem);
		font-weight: 500;
		color: var(--ink);
		text-decoration: none;
		letter-spacing: -0.02em;
		line-height: 1.1;
		padding: 12px 0;
		transition:
			color 220ms var(--motionEase),
			transform 220ms var(--motionEase);
		cursor: pointer;
		border: none;
		background: none;
	}

	.menu-link:hover {
		color: var(--accent);
		transform: translateY(-2px);
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-icon,
		.center-element,
		.menu-overlay,
		.menu-panel,
		.menu-close,
		.menu-link {
			transition: none;
			animation: none;
		}
	}
</style>
