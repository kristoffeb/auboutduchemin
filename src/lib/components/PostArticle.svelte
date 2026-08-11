<script lang="ts">
	import { onMount } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { formatPostDateLabel } from '$lib/post-date';
	import { renderRichTextMarkup } from '$lib/richtext';
	import { buildSeparatorSeed, getSeparatorBaseIndex } from '$lib/post-separator';
	import Mp3TrackPlayer from '$lib/components/Mp3TrackPlayer.svelte';

	export let post: any;
	export let postSlug: string | undefined = undefined;
	export let shouldAutoplay = true;
	export let showReadingProgress = true;
	export let isActive: boolean | undefined = undefined;
	export let feedPlaybackStore: Writable<boolean> | undefined = undefined;
	export let separatorIconIndex: number | undefined = undefined;

	const postContent = post?.content ?? {};
	type SeparatorIcon = {
		primaryPath: string;
		secondaryPath?: string;
	};

	const separatorIcons: SeparatorIcon[] = [
		{
			primaryPath:
				'M60 20 C52 8 40 6 30 14 C40 16 46 22 52 30 C56 28 58 24 60 20 C62 24 64 28 68 30 C74 22 80 16 90 14 C80 6 68 8 60 20 Z',
			secondaryPath: 'M60 12 L63 20 L60 28 L57 20 Z'
		},
		{
			primaryPath:
				'M18 20 C28 10 40 10 50 20 C40 30 28 30 18 20 M102 20 C92 10 80 10 70 20 C80 30 92 30 102 20',
			secondaryPath: 'M56 20 Q60 14 64 20 Q60 26 56 20 Z'
		},
		{
			primaryPath:
				'M24 20 C34 4 48 8 58 20 C48 32 34 36 24 20 M96 20 C86 4 72 8 62 20 C72 32 86 36 96 20',
			secondaryPath: 'M60 11 L65 20 L60 29 L55 20 Z'
		},
		{
			primaryPath:
				'M20 20 C34 14 44 10 58 20 C44 30 34 26 20 20 M100 20 C86 14 76 10 62 20 C76 30 86 26 100 20',
			secondaryPath: 'M60 15 C62 18 62 22 60 25 C58 22 58 18 60 15 Z'
		},
		{
			primaryPath:
				'M22 20 C30 8 44 8 54 20 C44 32 30 32 22 20 M98 20 C90 8 76 8 66 20 C76 32 90 32 98 20',
			secondaryPath: 'M54 20 L60 14 L66 20 L60 26 Z'
		},
		{
			primaryPath:
				'M20 20 C30 6 44 12 56 20 C44 28 30 34 20 20 M100 20 C90 6 76 12 64 20 C76 28 90 34 100 20',
			secondaryPath: 'M58 13 Q60 10 62 13 L62 27 Q60 30 58 27 Z'
		},
		{
			primaryPath:
				'M20 20 C36 6 46 14 56 20 C46 26 36 34 20 20 M100 20 C84 6 74 14 64 20 C74 26 84 34 100 20',
			secondaryPath: 'M60 12 C64 16 64 24 60 28 C56 24 56 16 60 12 Z'
		},
		{
			primaryPath:
				'M24 20 C36 12 44 4 56 20 C44 36 36 28 24 20 M96 20 C84 12 76 4 64 20 C76 36 84 28 96 20',
			secondaryPath: 'M56 20 C58 16 62 16 64 20 C62 24 58 24 56 20 Z'
		},
		{
			primaryPath:
				'M16 20 C30 8 44 8 58 20 C44 32 30 32 16 20 M104 20 C90 8 76 8 62 20 C76 32 90 32 104 20',
			secondaryPath: 'M60 10 L64 16 L60 30 L56 16 Z'
		},
		{
			primaryPath:
				'M18 20 C32 2 46 10 56 20 C46 30 32 38 18 20 M102 20 C88 2 74 10 64 20 C74 30 88 38 102 20',
			secondaryPath: 'M58 18 Q60 14 62 18 Q60 22 58 18 M58 24 Q60 20 62 24 Q60 28 58 24'
		},
		{
			primaryPath:
				'M20 20 C30 10 42 6 54 20 C42 34 30 30 20 20 M100 20 C90 10 78 6 66 20 C78 34 90 30 100 20',
			secondaryPath: 'M57 14 L63 14 L63 26 L57 26 Z'
		},
		{
			primaryPath:
				'M22 20 C34 6 48 6 60 20 C48 34 34 34 22 20 M98 20 C86 6 72 6 60 20 C72 34 86 34 98 20',
			secondaryPath: 'M60 12 L66 20 L60 28 L54 20 Z'
		}
	];

	function normalizeIconIndex(iconIndex: number) {
		return ((iconIndex % separatorIcons.length) + separatorIcons.length) % separatorIcons.length;
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
					(
						linkObject as {
							link?: unknown;
							url?: unknown;
							cached_url?: unknown;
							filename?: unknown;
							href?: unknown;
						}
					)?.link ??
						(
							linkObject as {
								link?: unknown;
								url?: unknown;
								cached_url?: unknown;
								filename?: unknown;
								href?: unknown;
							}
						)?.url ??
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
	const postDateLabel = formatPostDateLabel(post);

	const artistNameString = String(postContent.artist ?? '');
	const songTitleString = String(postContent.song ?? '');
	const mp3UrlString = String(postContent.mp3_file?.filename ?? '');
	const hasTrackBoolean = Boolean(artistNameString && songTitleString && mp3UrlString);
	const fallbackSeparatorIconIndex = getSeparatorBaseIndex(buildSeparatorSeed(post));
	let selectedSeparatorIcon: SeparatorIcon = separatorIcons[fallbackSeparatorIconIndex];
	$: selectedSeparatorIcon =
		separatorIcons[normalizeIconIndex(separatorIconIndex ?? fallbackSeparatorIconIndex)];

	let rootElement: HTMLElement | undefined;
	let readingProgress = 0;

	onMount(() => {
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

		const revealableNodes = rootElement?.querySelectorAll(
			'.contentBody p, .contentBody h2, .contentBody h3, .contentBody blockquote, .contentBody ul, .contentBody ol'
		);

		revealableNodes?.forEach((node, index) => {
			if (node instanceof HTMLElement) {
				node.style.setProperty('--reveal-delay', `${Math.min(index * 26, 220)}ms`);
			}
			node.classList.add('revealBlock');
			revealObserver.observe(node);
		});

		if (showReadingProgress) {
			updateReadingProgress();
			window.addEventListener('scroll', updateReadingProgress, { passive: true });
			window.addEventListener('resize', updateReadingProgress);
		}

		return () => {
			if (showReadingProgress) {
				window.removeEventListener('scroll', updateReadingProgress);
				window.removeEventListener('resize', updateReadingProgress);
			}
			revealObserver.disconnect();
		};
	});
</script>

<article class="postPage" bind:this={rootElement}>
	{#if showReadingProgress}
		<div
			class="readingProgress"
			aria-hidden="true"
			style={`--reading-progress:${readingProgress}%`}
		></div>
	{/if}

	<h1 class="postTitle">
		{#if postSlug}
			<a href="/{postSlug}">{postContent.title}</a>
		{:else}
			{postContent.title}
		{/if}
	</h1>

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
			{shouldAutoplay}
			visualMode="rail"
			ambientLabelString={artistNameString}
			{isActive}
			{feedPlaybackStore}
		/>
	{/if}

	<section class="contentBody">
		{@html renderedRichTextHtml}
	</section>

	{#if postContent.meta_description || linkItemsArray.length > 0 || postDateLabel}
		<section class="postExtras" aria-label="Post extras">
			<section class="postExtrasPanel">
				{#if postContent.meta_description || linkItemsArray.length > 0}
					<div class="postExtrasMeta">
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
					</div>
				{/if}

				{#if postDateLabel}
					<p class="postDate">{postDateLabel}</p>
				{/if}
			</section>
		</section>
	{/if}

	<div class="postSeparator" aria-hidden="true">
		<span class="separatorLine"></span>
		<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" class="literatureIcon">
			<path
				d={selectedSeparatorIcon.primaryPath}
				fill="none"
				stroke="currentColor"
				stroke-width="1.8"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			{#if selectedSeparatorIcon.secondaryPath}
				<path
					d={selectedSeparatorIcon.secondaryPath}
					fill="none"
					stroke="currentColor"
					stroke-width="1.4"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			{/if}
		</svg>
		<span class="separatorLine"></span>
	</div>
</article>

<style>
	.postTitle a {
		color: inherit;
		text-decoration: none;
		transition: opacity 200ms var(--motionEase);
	}

	.postTitle a:hover {
		opacity: 0.7;
	}

	.postInlineLink {
		text-decoration: none;
		color: var(--accent);
		transition: color 400ms var(--motionEase);
	}

	.postInlineLink:hover {
		color: color-mix(in srgb, var(--accent) 80%, transparent);
	}

	.postSeparator {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1.1rem;
		margin-top: 3rem;
		padding-top: 2rem;
	}

	.literatureIcon {
		width: 70px;
		height: 26px;
		color: var(--mutedText);
		opacity: 0.78;
		transition:
			opacity 300ms var(--motionEase),
			color 300ms var(--motionEase);
	}

	.separatorLine {
		display: block;
		width: min(23vw, 210px);
		height: 1px;
		background: color-mix(in srgb, var(--accent) 24%, transparent);
		transition: background-color 300ms var(--motionEase);
	}

	.postSeparator:hover .literatureIcon {
		opacity: 1;
		color: var(--accent);
	}

	.postSeparator:hover .separatorLine {
		background: color-mix(in srgb, var(--accent) 46%, transparent);
	}

	@media (prefers-reduced-motion: reduce) {
		.postInlineLink {
			transition: none;
		}

		.postTitle a {
			transition: none;
		}

		.literatureIcon {
			transition: none;
		}

		.separatorLine {
			transition: none;
		}
	}
</style>
