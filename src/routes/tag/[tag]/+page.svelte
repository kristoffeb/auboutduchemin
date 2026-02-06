<script lang="ts">
	export let data;

	const tag = data.tag;
	const posts = data.posts;
</script>

<svelte:head>
	<title>Tag: {tag} — My Blog</title>
	<meta name="description" content={'Posts tagged ' + tag} />
</svelte:head>

<main>
	<a href="/">← Home</a>

	<h1>Tag: {tag}</h1>

	{#if posts.length === 0}
		<p>No posts found.</p>
	{:else}
		<div class="stack">
			{#each posts as post}
				<div class="card">
					<h2>
						<a href="/{post.slug}">
							{post.content.title}
						</a>
					</h2>

					{#if post.content.cover?.filename}
						<img src={post.content.cover.filename} alt={post.content.title} />
					{/if}

					{#if post.content.meta_description}
						<p>{post.content.meta_description}</p>
					{/if}

					<p class="meta">
						<a href="/{post.slug}">Read →</a>
					</p>
				</div>
			{/each}
		</div>
	{/if}
</main>
