<script lang="ts">
	import { onMount } from 'svelte';
	import { renderRichText } from '$lib/richtext';
	import Mp3TrackPlayer from '$lib/components/Mp3TrackPlayer.svelte';

	export let data;

	const postObject = data.post;
	const postContent = postObject?.content ?? {};

	const renderedRichTextHtml = postContent.text ? renderRichText(postContent.text) : '';
	const externalLinksArray = Array.isArray(postContent.external_links)
		? postContent.external_links
		: [];

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

	{#if postContent.meta_description}
		<meta name="description" content={postContent.meta_description} />
		<meta property="og:description" content={postContent.meta_description} />
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

	{#if externalLinksArray.length > 0}
		<div class="greenLinksRow">
			{#each externalLinksArray as linkObject}
				{#if linkObject?.url}
					<a class="greenLinkItem" href={linkObject.url} target="_blank" rel="noopener noreferrer">
						{linkObject.label ?? linkObject.url}
					</a>
				{/if}
			{/each}
		</div>
	{/if}

	<article class="contentBody">
		{@html renderedRichTextHtml}
	</article>
</main>

<style>
</style>
