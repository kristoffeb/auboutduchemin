<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/assets/favicon.jpg" type="image/jpeg" />
</svelte:head>

{@render children()}
