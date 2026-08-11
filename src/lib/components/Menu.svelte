<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	const closeAnimationDurationMs = 360;
	let closeMenuTimeout: ReturnType<typeof setTimeout> | undefined;

	let isOpen = false;
	let isClosing = false;
	let isVisible = false;
	$: isVisible = isOpen || isClosing;

	function clearCloseMenuTimeout() {
		if (closeMenuTimeout !== undefined) {
			clearTimeout(closeMenuTimeout);
			closeMenuTimeout = undefined;
		}
	}

	function getCloseAnimationDelayMs() {
		if (
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			return 0;
		}
		return closeAnimationDurationMs;
	}

	function finishMenuClose() {
		isClosing = false;
		clearCloseMenuTimeout();
	}

	function startMenuClose() {
		if (!isOpen && !isClosing) return;

		isOpen = false;
		isClosing = true;
		clearCloseMenuTimeout();

		const closeDelayMs = getCloseAnimationDelayMs();
		if (closeDelayMs === 0) {
			finishMenuClose();
			return;
		}

		closeMenuTimeout = setTimeout(() => {
			finishMenuClose();
		}, closeDelayMs);
	}

	function openMenu() {
		clearCloseMenuTimeout();
		isClosing = false;
		isOpen = true;
	}

	function toggleMenu() {
		if (isOpen) {
			startMenuClose();
			return;
		}
		openMenu();
	}

	function closeMenu() {
		startMenuClose();
	}

	async function handleLinkClick(event: MouseEvent) {
		const linkElement = event.currentTarget;
		if (!(linkElement instanceof HTMLAnchorElement)) return;

		const href = linkElement.getAttribute('href')?.trim() ?? '';
		if (!href) {
			closeMenu();
			return;
		}

		const isRegularLeftClick =
			event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
		const isInternalPath = href.startsWith('/');

		if (
			!isRegularLeftClick ||
			!isInternalPath ||
			linkElement.target === '_blank' ||
			linkElement.hasAttribute('download')
		) {
			closeMenu();
			return;
		}

		event.preventDefault();
		await goto(href);
		startMenuClose();
	}

	onMount(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isVisible) {
				closeMenu();
			}
		};

		document.addEventListener('keydown', handleEscape);

		return () => {
			document.removeEventListener('keydown', handleEscape);
			clearCloseMenuTimeout();
			document.body.style.overflow = '';
		};
	});

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = isVisible ? 'hidden' : '';
	}
</script>

<button
	class="menu-button"
	class:open={isOpen}
	aria-label="Toggle navigation menu"
	aria-expanded={isVisible}
	on:click={toggleMenu}
	title="Menu"
>
	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="menu-icon" class:open={isOpen}>
		<path
			class="menu-swirl menu-swirl-top"
			d="M3.5 7 C7.2 4.4 11.4 4.3 15.2 7 C17 8.2 18.8 8.5 20.5 7.2"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			class="menu-swirl menu-swirl-middle"
			d="M3.5 12 C7.3 9.5 11.3 9.5 15.1 12 C17.1 13.3 18.9 13.6 20.5 12.3"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			class="menu-swirl menu-swirl-bottom"
			d="M3.5 17 C7.2 14.4 11.4 14.5 15.2 17 C17.1 18.2 18.9 18.6 20.5 17.2"
			fill="none"
			stroke="currentColor"
			stroke-width="1.8"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			class="menu-swirl-center"
			d="M11.4 12 L12.1 10.6 L12.8 12 L12.1 13.4 Z"
			fill="currentColor"
		/>
	</svg>
</button>

{#if isVisible}
	<div
		class="menu-overlay"
		class:closing={isClosing}
		role="dialog"
		aria-modal="true"
		aria-label="Site navigation"
		tabindex="-1"
		on:pointerdown|self={closeMenu}
	>
		<div class="menu-panel" class:closing={isClosing}>
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
		padding: 8px 0 8px 8px;
		margin-right: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		transition:
			opacity 220ms var(--motionEase),
			transform 280ms var(--motionEase);
	}

	.menu-button:hover {
		opacity: 0.9;
		transform: translateY(-1px);
	}

	.menu-button:active {
		transform: translateY(0);
	}

	.menu-icon {
		width: 24px;
		height: 24px;
		transition: transform 340ms cubic-bezier(0.35, 0.46, 0.15, 0.94);
		transform-origin: center;
	}

	.menu-swirl {
		stroke-dasharray: 28 8;
		stroke-dashoffset: 0;
		transition:
			transform 340ms cubic-bezier(0.35, 0.46, 0.15, 0.94),
			stroke-dashoffset 380ms var(--motionEase),
			opacity 240ms var(--motionEase);
		transform-origin: center;
	}

	.menu-swirl-center {
		opacity: 0.65;
		transform-origin: center;
		transition:
			opacity 240ms var(--motionEase),
			transform 340ms cubic-bezier(0.35, 0.46, 0.15, 0.94);
	}

	.menu-button:hover .menu-swirl {
		stroke-dashoffset: -6;
	}

	.menu-button:hover .menu-swirl-center {
		opacity: 1;
		transform: scale(1.08);
	}

	.menu-icon.open {
		transform: rotate(90deg) scale(0.96);
	}

	.menu-icon.open .menu-swirl-top {
		transform: translateY(4.8px) rotate(18deg);
	}

	.menu-icon.open .menu-swirl-middle {
		opacity: 0;
		transform: scaleX(0.8);
	}

	.menu-icon.open .menu-swirl-bottom {
		transform: translateY(-4.8px) rotate(-18deg);
	}

	.menu-icon.open .menu-swirl-center {
		opacity: 1;
		transform: scale(0.7);
	}

	.menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--paper);
		z-index: 120;
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

	.menu-overlay.closing {
		animation: overlayFadeDown 360ms var(--motionEase) forwards;
	}

	@keyframes overlayFadeDown {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
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

	.menu-panel.closing {
		animation: panelFadeDown 360ms var(--motionEase) forwards;
	}

	@keyframes panelFadeDown {
		from {
			opacity: 1;
			transform: translateY(0);
		}
		to {
			opacity: 0;
			transform: translateY(28px);
		}
	}

	.menu-close {
		position: fixed;
		top: 110px;
		right: 0;
		background: none;
		border: none;
		cursor: pointer;
		width: 30px;
		height: 30px;
		padding: 0;
		margin: 26px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--accent);
		transition: transform 300ms var(--motionEase);
		z-index: 99;
	}

	@media (max-width: 860px) {
		.menu-close {
			top: 106px;
			right: 0;
		}
	}

	@media (max-width: 600px) {
		.menu-close {
			top: 84px;
			right: 0;
			margin: 12px;
		}

		.menu-link {
			font-size: clamp(1.5rem, 6vw, 3rem);
		}

		.menu-panel {
			padding: 60px 16px 16px;
		}

		.menu-button {
			padding: 6px 0 6px 6px;
		}
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
		.menu-button,
		.menu-icon,
		.menu-swirl,
		.menu-swirl-center,
		.menu-overlay,
		.menu-panel,
		.menu-close,
		.menu-link {
			transition: none;
			animation: none;
		}
	}
</style>
