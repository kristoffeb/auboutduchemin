<script lang="ts">
	export let data;
	const post = data.latest;
</script>

<svelte:head>
	<title>My Blog</title>
	<meta name="description" content="A minimal blog." />
</svelte:head>

<main>
	<h1>My Blog</h1>

	{#if post}
		<div class="card">
			<h2>
				<a href="/{post.slug}">
					{post.content.title}
				</a>
			</h2>

			{#if post.content.cover?.filename}
				<img src={post.content.cover.filename} />
			{/if}

			<p>{post.content.meta_description}</p>
		</div>
	{:else}
		<p>No posts yet.</p>
	{/if}
</main>
