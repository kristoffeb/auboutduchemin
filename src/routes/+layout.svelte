<script lang="ts">
	import { beforeNavigate } from '$app/navigation';
	import { basePostGradientEndColor } from '$lib/post-gradient';
	import '../app.css';
	import Header from '$lib/Header.svelte';

	let { children } = $props();
	let isTransitioning = $state(false);

	beforeNavigate(({ willUnload, to }) => {
		if (!willUnload && to?.route.id !== null) {
			isTransitioning = true;
			// Reset after page loads
			setTimeout(() => {
				isTransitioning = false;
			}, 300);
		}
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const getActivePostElement = () =>
			document.querySelector<HTMLElement>('[data-background-transition-active="true"]');

		const handleScroll = () => {
			const html = document.documentElement;
			const activePostElement = getActivePostElement();
			const activePostGradientEndColor =
				activePostElement?.dataset.gradientEndColor?.trim() || basePostGradientEndColor;
			let scrollPercentage = 0;

			html.style.setProperty('--post-gradient-end-color', activePostGradientEndColor);

			if (activePostElement) {
				const activePostTop = activePostElement.getBoundingClientRect().top + window.scrollY;
				const activePostHeight = Math.max(activePostElement.offsetHeight, 1);
				scrollPercentage = ((window.scrollY - activePostTop) / activePostHeight) * 100;
			} else {
				scrollPercentage =
					(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
			}

			if (scrollPercentage > 20) {
				html.classList.add('dark-transition');
			} else {
				html.classList.remove('dark-transition');
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<link rel="icon" href="/assets/favicon.jpg" type="image/jpeg" />
</svelte:head>

<Header />

<main class="page-content" class:transitioning={isTransitioning}>
	{@render children()}
</main>

<style>
	.page-content {
		transition: opacity 300ms var(--motionEase);
	}

	.page-content.transitioning {
		opacity: 0;
	}
</style>
