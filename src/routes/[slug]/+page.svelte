<script lang="ts">
	import { renderRichText } from '$lib/richtext';

	export let data;
	const post = data.post;
	const c = post.content;

	const html = renderRichText(c.text);
</script>

<svelte:head>
	<title>{c.title} — My Blog</title>
	<meta name="description" content={c.meta_description} />
	<meta property="og:title" content={c.title} />
	<meta property="og:image" content={c.cover?.filename} />
</svelte:head>

<main>
	<a href="/">← Home</a>

	<h1>{c.title}</h1>

	{#if c.cover?.filename}
		<img src={c.cover.filename} />
	{/if}

	{@html html}

	{#if c.media}
		<h2>Media</h2>

		{#each c.media as block}
			{#if block.url}
				<iframe width="100%" height="152" frameborder="0" src={block.url}></iframe>
			{/if}
		{/each}
	{/if}
</main>
