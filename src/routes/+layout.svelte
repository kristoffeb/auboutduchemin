<script lang="ts">
	import '../app.css';
	import Header from '$lib/Header.svelte';

	let { children } = $props();

	$effect(() => {
		if (typeof window === 'undefined') return;

		const getActivePostElement = () =>
			document.querySelector<HTMLElement>('[data-background-transition-active="true"]');

		const handleScroll = () => {
			const html = document.documentElement;
			const activePostElement = getActivePostElement();
			let scrollPercentage = 0;

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

{@render children()}
