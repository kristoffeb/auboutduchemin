<script lang="ts">
	import { onMount } from 'svelte';
	import { renderRichTextMarkup, renderRichTextText } from '$lib/richtext';
	import Mp3TrackPlayer from '$lib/components/Mp3TrackPlayer.svelte';

	export let data;

	const postObject = data.post;
	const postContent = postObject?.content ?? {};

	function normalizeStringArray(value: unknown) {
		if (!Array.isArray(value)) return [];

		return value
			.map((item: unknown) => String(item).trim())
			.filter((item): item is string => Boolean(item));
	}

	function extractLinkHref(value: unknown) {
		if (typeof value === 'string') return value.trim();
		if (!value || typeof value !== 'object') return '';

		const linkValue = value as {
			cached_url?: unknown;
			url?: unknown;
			filename?: unknown;
			href?: unknown;
			linktype?: unknown;
		};

		const rawHref = String(
			linkValue.url ?? linkValue.cached_url ?? linkValue.filename ?? linkValue.href ?? ''
		).trim();

		if (!rawHref) return '';

		if (String(linkValue.linktype ?? '') === 'story' && !rawHref.startsWith('/')) {
			return `/${rawHref}`;
		}

		return rawHref;
	}

	function extractLinkLabel(value: unknown, href: string) {
		if (!value || typeof value !== 'object') return href;

		const linkValue = value as { label?: unknown; title?: unknown; text?: unknown };
		return String(linkValue.label ?? linkValue.title ?? linkValue.text ?? href).trim() || href;
	}

	function normalizeLinkItems(value: unknown) {
		if (!Array.isArray(value)) return [];

		return value
			.map((linkObject: unknown) => {
				const href = extractLinkHref(
					(linkObject as { link?: unknown; url?: unknown; cached_url?: unknown; filename?: unknown; href?: unknown })?.link ??
						(linkObject as { link?: unknown; url?: unknown; cached_url?: unknown; filename?: unknown; href?: unknown })?.url ??
						linkObject
				);
				const label = extractLinkLabel(linkObject, href);

				return href ? { href, label } : null;
			})
			.filter((linkItem): linkItem is { href: string; label: string } => linkItem !== null);
	}

	const renderedRichTextHtml = postContent.text ? renderRichTextMarkup(postContent.text) : '';
	const linkItemsArray = normalizeLinkItems(postContent.links ?? postContent.external_links);
	const metaDescriptionHtml = renderRichTextMarkup(postContent.meta_description);
	const metaDescriptionText = renderRichTextText(postContent.meta_description);

	const artistNameString = String(postContent.artist ?? '');
	const songTitleString = String(postContent.song ?? '');
	const mp3UrlString = String(postContent.mp3_file?.filename ?? '');
	const hasTrackBoolean = Boolean(artistNameString && songTitleString && mp3UrlString);

	let readingProgress = 0;

	onMount(() => {
		document.documentElement.dataset.articleTheme = 'sage';

		const updateReadingProgress = () => {
			const documentElement = document.documentElement;
			const scrollableHeight = documentElement.scrollHeight - window.innerHeight;

			if (scrollableHeight <= 0) {
				readingProgress = 0;
				return;
			}

			readingProgress = Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100));
		};

		const revealObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('isVisible');
						revealObserver.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
		);

		const revealableNodes = document.querySelectorAll(
			'.contentBody p, .contentBody h2, .contentBody h3, .contentBody blockquote, .contentBody ul, .contentBody ol'
		);

		revealableNodes.forEach((node, index) => {
			if (node instanceof HTMLElement) {
				node.style.setProperty('--reveal-delay', `${Math.min(index * 26, 220)}ms`);
			}
			node.classList.add('revealBlock');
			revealObserver.observe(node);
		});

		updateReadingProgress();
		window.addEventListener('scroll', updateReadingProgress, { passive: true });
		window.addEventListener('resize', updateReadingProgress);

		return () => {
			window.removeEventListener('scroll', updateReadingProgress);
			window.removeEventListener('resize', updateReadingProgress);
			revealObserver.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{postContent.title} — My Blog</title>

	{#if metaDescriptionText}
		<meta name="description" content={metaDescriptionText} />
		<meta property="og:description" content={metaDescriptionText} />
	{/if}

	{#if postContent.title}
		<meta property="og:title" content={postContent.title} />
	{/if}

	{#if postContent.cover?.filename}
		<meta property="og:image" content={postContent.cover.filename} />
	{/if}
</svelte:head>

<main class="postPage">
	<div class="readingProgress" aria-hidden="true" style={`--reading-progress:${readingProgress}%`}></div>

	<h1 class="postTitle">{postContent.title}</h1>

	{#if postContent.cover?.filename}
		<section class="heroSection">
			<img class="heroImage" src={postContent.cover.filename} alt={postContent.title} />
		</section>
	{/if}

	{#if hasTrackBoolean}
		<Mp3TrackPlayer
			{artistNameString}
			{songTitleString}
			{mp3UrlString}
			isFixedLayout={true}
			shouldAutoplay={true}
			visualMode="rail"
			ambientLabelString={artistNameString}
		/>
	{/if}

	<article class="contentBody">
		{@html renderedRichTextHtml}
	</article>

	{#if postContent.meta_description || linkItemsArray.length > 0}
		<section class="postExtras" aria-label="Post extras">
			<section class="postExtrasPanel">
				{#if postContent.meta_description}
					<section class="postMetaDescription" aria-label="Meta description">
						<div>{@html metaDescriptionHtml}</div>
					</section>
				{/if}

				{#if linkItemsArray.length > 0}
					<nav class="postLinks" aria-label="Links">
						<ul class="postLinksList">
							{#each linkItemsArray as linkItem, index}
								<li class="postLinksListItem">
									<a
										class="postInlineLink"
										href={linkItem.href}
										target="_blank"
										rel="noopener noreferrer"
									>
										{linkItem.label}
									</a>
									{#if index < linkItemsArray.length - 1}
										<span class="postLinkSeparator" aria-hidden="true">·</span>
									{/if}
								</li>
							{/each}
						</ul>
					</nav>
				{/if}
			</section>
		</section>
	{/if}
</main>

<style>
	.postInlineLink {
		text-decoration: none;
		color: var(--accent);
		transition: color 400ms var(--motionEase);
	}

	.postInlineLink:hover {
		color: color-mix(in srgb, var(--accent) 80%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.postInlineLink {
			transition: none;
		}
	}
</style>
