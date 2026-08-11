<script lang="ts">
	import { renderRichTextMarkup, renderRichTextText } from '$lib/richtext';

	export let data;

	const aboutPage = data.aboutPage ?? null;
	const aboutContent = aboutPage?.content ?? {};
	const aboutTitle = String(aboutContent.title ?? aboutPage?.name ?? 'À propos');
	const richTextContent = aboutContent.text ?? aboutContent.body ?? aboutContent.content ?? null;
	const contentMarkup = renderRichTextMarkup(richTextContent);
	const metaDescriptionText = renderRichTextText(
		aboutContent.meta_description ?? aboutContent.description ?? richTextContent
	);
</script>

<svelte:head>
	<title>About — Au Bout Du Chemin</title>
	<meta name="description" content={metaDescriptionText || 'A propos de Au Bout Du Chemin.'} />
</svelte:head>

<main class="postPage staticPage">
	<h1 class="postTitle">{aboutTitle}</h1>

	{#if contentMarkup}
		<section class="contentBody aboutContent" aria-label={aboutTitle}>
			{@html contentMarkup}
		</section>
	{:else}
		<section class="contentBody aboutContent" aria-label={aboutTitle}>
			<p class="loadingPlaceholder">Aucun contenu disponible pour le moment.</p>
		</section>
	{/if}
</main>

<style>
	.staticPage {
		padding-bottom: 120px;
	}

	.loadingPlaceholder {
		color: color-mix(in srgb, var(--ink) 60%, transparent);
		font-style: italic;
		margin: 2rem 0;
	}

	.aboutContent :global(a) {
		text-decoration: underline;
		text-decoration-color: var(--linkUnderline);
		text-underline-offset: 0.18em;
	}

	.aboutContent p:first-of-type::first-letter {
		float: none;
		font-size: inherit;
		line-height: inherit;
		margin: 0;
		font-weight: inherit;
		color: inherit;
	}

	.aboutContent :global(p:last-child) {
		font-size: 0.92em;
	}

	@media (max-width: 860px) {
		.staticPage {
			padding-bottom: 142px;
		}
	}

	@media (max-width: 600px) {
		.staticPage {
			padding-bottom: 120px;
		}
	}
</style>
