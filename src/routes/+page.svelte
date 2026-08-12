<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import PostArticle from '$lib/components/PostArticle.svelte';
	import { getPostGradientEndColor } from '$lib/post-gradient';
	import { buildNonRepeatingSeparatorIndices } from '$lib/post-separator';
	import { renderRichTextText } from '$lib/richtext';

	export let data;
	const posts = data.posts ?? [];
	const latestPost = posts[0] ?? null;
	const siteTitle = "Au Bout Du Chemin - Audioblog / Portfolio / Recueil d'émois";
	const metaDescriptionText = latestPost
		? renderRichTextText(latestPost.content?.meta_description)
		: '';
	const separatorIconIndices = buildNonRepeatingSeparatorIndices(posts);
	const postGradientEndColors = new Map(
		posts.map((post) => [post.slug, getPostGradientEndColor(post)])
	);

	/** Shared across all feed players: true while the user wants audio to keep playing. */
	const feedPlaybackStore = writable(false);
	let pageTitle = siteTitle;

	let visiblePostsCount = posts.length;
	const visibleRatios = new Map<string, number>();
	const postElements = new Map<string, HTMLElement>();
	let nextPostObserver: IntersectionObserver | undefined;
	let activePostObserver: IntersectionObserver | undefined;
	let activeSlug = '';
	let canLoadOnIntersection = true;
	let lastObservedLoadNode: HTMLElement | undefined;

	function setFeedPostElement(node: HTMLElement, postSlug: string) {
		postElements.set(postSlug, node);
		activePostObserver?.observe(node);

		// Observe the H1 of this post for the load trigger — fires when the title
		// first crosses the bottom edge of the viewport (i.e. becomes visible).
		const h1 = node.querySelector('h1') as HTMLElement | null;
		const loadTarget = h1 ?? node;

		// Each newly-added post is the last in the list — hand off the load
		// trigger from the previous last post to this one.
		if (lastObservedLoadNode) {
			nextPostObserver?.unobserve(lastObservedLoadNode);
			canLoadOnIntersection = true;
		}
		lastObservedLoadNode = loadTarget;
		nextPostObserver?.observe(loadTarget);

		return {
			destroy() {
				activePostObserver?.unobserve(node);
				nextPostObserver?.unobserve(loadTarget);
				if (lastObservedLoadNode === loadTarget) lastObservedLoadNode = undefined;
				postElements.delete(postSlug);
				visibleRatios.delete(postSlug);
			}
		};
	}

	function updateVisiblePostUrl() {
		if (typeof window === 'undefined') return;

		let candidateSlug = '';
		let candidateRatio = 0;

		for (const [postSlug, ratio] of visibleRatios.entries()) {
			if (ratio > candidateRatio) {
				candidateSlug = postSlug;
				candidateRatio = ratio;
			}
		}

		if (!candidateSlug || candidateSlug === activeSlug) return;

		activeSlug = candidateSlug;
		const activePostTitle =
			posts.find((post) => post.slug === candidateSlug)?.content?.title ?? candidateSlug;
		pageTitle =
			candidateSlug === (posts[0]?.slug ?? '')
				? siteTitle
				: `Au Bout Du Chemin - ${activePostTitle}`;
		document.documentElement.classList.remove('dark-transition');
		window.dispatchEvent(new Event('scroll'));
		// Keep the root URL for the first/initial post; only push a slug for subsequent ones.
		const isFirstPost = candidateSlug === (posts[0]?.slug ?? '');
		const nextPathname = isFirstPost ? '/' : `/${candidateSlug}`;

		if (window.location.pathname !== nextPathname) {
			window.history.replaceState(window.history.state, '', nextPathname);
		}
	}

	function loadNextPost() {
		if (visiblePostsCount >= posts.length) return;
		visiblePostsCount += 1;
	}

	onMount(() => {
		document.documentElement.dataset.articleTheme = 'sage';

		nextPostObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					if (!canLoadOnIntersection) continue;
					if (entry.target !== lastObservedLoadNode) continue;

					canLoadOnIntersection = false;
					nextPostObserver?.unobserve(entry.target);
					loadNextPost();
				}
			},
			// Fire as soon as the last post's top edge (hero area) enters the visible viewport.
			{ threshold: 0, rootMargin: '0px 0px 0px 0px' }
		);

		activePostObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const postSlug = (entry.target as HTMLElement).dataset.postSlug ?? '';
					if (!postSlug) continue;
					visibleRatios.set(postSlug, entry.isIntersecting ? entry.intersectionRatio : 0);
				}

				updateVisiblePostUrl();
			},
			{
				threshold: [0.2, 0.35, 0.5, 0.65, 0.8],
				rootMargin: '-10% 0px -32% 0px'
			}
		);

		if (lastObservedLoadNode) {
			nextPostObserver.observe(lastObservedLoadNode);
		}

		postElements.forEach((postElement) => {
			activePostObserver?.observe(postElement);
		});

		return () => {
			nextPostObserver?.disconnect();
			activePostObserver?.disconnect();
		};
	});
</script>

<svelte:head>
	<title>{pageTitle}</title>

	{#if metaDescriptionText}
		<meta name="description" content={metaDescriptionText} />
	{:else}
		<meta name="description" content="A minimal blog." />
	{/if}
</svelte:head>

{#if latestPost}
	<section class="infiniteFeed">
		{#each posts.slice(0, visiblePostsCount) as post, postIndex (post.slug)}
			<div
				class="feedPost"
				data-post-slug={post.slug}
				data-gradient-end-color={postGradientEndColors.get(post.slug)}
				data-background-transition-active={post.slug === activeSlug ||
				(!activeSlug && post.slug === latestPost.slug)
					? 'true'
					: undefined}
				use:setFeedPostElement={post.slug}
			>
				<PostArticle
					{post}
					postSlug={post.slug}
					shouldAutoplay={false}
					showReadingProgress={false}
					isActive={post.slug === activeSlug || (!activeSlug && post.slug === latestPost.slug)}
					{feedPlaybackStore}
					separatorIconIndex={separatorIconIndices[postIndex]}
				/>
			</div>
		{/each}
	</section>
{:else}
	<main>
		<p>No posts yet.</p>
	</main>
{/if}

<style>
	.infiniteFeed {
		display: flex;
		flex-direction: column;
		gap: 70px;
	}

	.feedPost {
		position: relative;
	}
</style>
