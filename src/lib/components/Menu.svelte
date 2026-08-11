<script lang="ts">
	import { onMount } from 'svelte';

	let isOpen = false;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	function closeMenu() {
		isOpen = false;
	}

	function handleLinkClick() {
		// Add a small delay to allow fade animation before navigation
		closeMenu();
	}

	onMount(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeMenu();
			}
		};

		document.addEventListener('keydown', handleEscape);

		// Lock/unlock scrolling based on menu state
		const updateScroll = () => {
			if (isOpen) {
				document.body.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
			}
		};

		// Watch isOpen changes
		updateScroll();

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = '';
		};
	});

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = isOpen ? 'hidden' : '';
	}
</script>

<button
	class="menu-button"
	aria-label="Toggle navigation menu"
	aria-expanded={isOpen}
	on:click={toggleMenu}
	title="Menu"
>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-icon" class:open={isOpen}>
		<!-- Top line -->
		<line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		<!-- Middle line -->
		<line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		<!-- Bottom line -->
		<line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
				<a href="/about" class="menu-link" on:click={handleLinkClick}>à propos</a>
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
		width: 24px;
		height: 24px;
		transition: transform 300ms cubic-bezier(0.35, 0.46, 0.15, 0.94);
	}

	.menu-icon.open {
		transform: rotate(90deg);
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
		overflow: hidden;
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
		padding: 80px 20px 20px;
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
		top: 20px;
		right: 20px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 12px;
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
			transform 220ms var(--motionEase),
			opacity 300ms var(--motionEase);
		cursor: pointer;
		border: none;
		background: none;
	}

	.menu-link:hover {
		color: var(--accent);
		transform: translateY(-2px);
	}

	.menu-link:active {
		opacity: 0.7;
	}

	@media (prefers-reduced-motion: reduce) {
		.menu-icon,
		.menu-overlay,
		.menu-panel,
		.menu-close,
		.menu-link {
			transition: none;
			animation: none;
		}
	}
</style>
