<script lang="ts">
	import '../app.css';
	import Header from '$lib/Header.svelte';

	let { children } = $props();

	$effect(() => {
		if (typeof window === 'undefined') return;

		const handleScroll = () => {
			const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
			const html = document.documentElement;

			if (scrollPercentage > 20) {
				html.classList.add('dark-transition');
			} else {
				html.classList.remove('dark-transition');
			}
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<link rel="icon" href="/assets/favicon.jpg" type="image/jpeg" />
</svelte:head>

<Header />

{@render children()}
