<script lang="ts">
	import { renderRichTextText } from '$lib/richtext';

	export let data;

	const tag = data.tag;
	const posts = data.posts;
</script>

<svelte:head>
	<title>Au Bout Du Chemin - Tag: {tag}</title>
	<meta name="description" content={'Posts tagged ' + tag} />
</svelte:head>

<main>
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
						<p>{renderRichTextText(post.content.meta_description)}</p>
					{/if}

					<p class="meta">
						<a href="/{post.slug}">Read →</a>
					</p>
				</div>
			{/each}
		</div>
	{/if}
</main>

<style>
	main {
		max-width: var(--maxWidth);
		margin: 42px auto;
		padding: 0 22px 80px;
	}

	h1 {
		font-family: var(--fontDisplay);
		font-size: clamp(var(--titleMin), var(--titleFluid), var(--titleMax));
		line-height: 0.96;
		font-weight: 700;
		letter-spacing: -0.02em;
		width: 100%;
		max-width: none;
		color: var(--ink);
		margin: 0 0 26px;
	}

	.stack {
		display: grid;
		gap: 40px;
		margin-top: 40px;
	}

	.card {
		padding: 20px 0;
		border-bottom: 1px solid color-mix(in srgb, var(--accent) 20%, transparent);
	}

	.card:last-child {
		border-bottom: none;
	}

	.card h2 {
		font-family: var(--fontDisplay);
		font-size: 1.8rem;
		font-weight: 700;
		margin: 0 0 16px;
		line-height: 1.2;
	}

	.card h2 a {
		color: var(--ink);
		text-decoration: none;
		transition: color 200ms var(--motionEase);
	}

	.card h2 a:hover {
		color: var(--accent);
	}

	.card img {
		width: 100%;
		margin: 16px 0;
		border-radius: 2px;
	}

	.card p {
		color: var(--text);
		line-height: 1.7;
		margin: 12px 0;
	}

	.card .meta {
		font-weight: 700;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-top: 16px;
	}

	.card .meta a {
		color: var(--accent);
		text-decoration: none;
		transition: color 200ms var(--motionEase);
	}

	.card .meta a:hover {
		text-decoration: underline;
	}

	@media (max-width: 860px) {
		main {
			padding: 0 16px 142px;
		}

		h1 {
			font-size: clamp(1.8rem, 5.5vw, 2.5rem);
		}

		.card h2 {
			font-size: 1.5rem;
		}
	}

	@media (max-width: 600px) {
		main {
			padding: 0 12px 120px;
			margin: 32px auto;
		}

		h1 {
			font-size: clamp(1.6rem, 4.5vw, 2.2rem);
			margin-bottom: 20px;
		}

		.stack {
			gap: 24px;
		}

		.card {
			padding: 16px 0;
		}

		.card h2 {
			font-size: 1.3rem;
			margin-bottom: 12px;
		}

		.card img {
			margin: 12px 0;
		}

		.card p {
			font-size: 0.95rem;
			margin: 10px 0;
		}

		.card .meta {
			font-size: 0.8rem;
			margin-top: 12px;
		}
	}
</style>
