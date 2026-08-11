<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { renderRichTextText } from '$lib/richtext';
	import { buildNonRepeatingSeparatorIndices } from '$lib/post-separator';
	import PostArticle from '$lib/components/PostArticle.svelte';

	export let data;

	const post = data.post;
	const allPosts = data.posts ?? [];
	const currentSlug = post?.slug ?? '';
	const postContent = post?.content ?? {};
	const metaDescriptionText = renderRichTextText(postContent.meta_description);

	// Build the feed starting from the current post. Use the richer single-post
	// data for the first item; subsequent items come from the list fetch.
	const startIndex = allPosts.findIndex((p: any) => p.slug === currentSlug);
	const tail = startIndex >= 0 ? allPosts.slice(startIndex + 1) : [];
	const posts: any[] = post ? [post, ...tail] : tail;
	const separatorIconIndices = buildNonRepeatingSeparatorIndices(posts);

	/** Shared across all feed players: true while the user wants audio to keep playing. */
	const feedPlaybackStore = writable(false);

	let visiblePostsCount = post ? 1 : 0;
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

		const h1 = node.querySelector('h1') as HTMLElement | null;
		const loadTarget = h1 ?? node;

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
		document.documentElement.classList.remove('dark-transition');
		window.dispatchEvent(new Event('scroll'));

		const nextPathname = `/${candidateSlug}`;
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
					if (entry.isIntersecting && canLoadOnIntersection) {
						canLoadOnIntersection = false;
						loadNextPost();
					}

					if (!entry.isIntersecting) {
						canLoadOnIntersection = true;
					}
				}
			},
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

{#if posts.length > 0}
	<section class="infiniteFeed">
		{#each posts.slice(0, visiblePostsCount) as feedPost, postIndex (feedPost.slug)}
			<div
				class="feedPost"
				data-post-slug={feedPost.slug}
				data-background-transition-active={feedPost.slug === activeSlug ||
				(!activeSlug && feedPost.slug === currentSlug)
					? 'true'
					: undefined}
				use:setFeedPostElement={feedPost.slug}
			>
				<PostArticle
					post={feedPost}
					postSlug={feedPost.slug}
					shouldAutoplay={feedPost.slug === currentSlug}
					showReadingProgress={feedPost.slug === currentSlug && visiblePostsCount === 1}
					isActive={feedPost.slug === activeSlug || (!activeSlug && feedPost.slug === currentSlug)}
					{feedPlaybackStore}
					separatorIconIndex={separatorIconIndices[postIndex]}
				/>
			</div>
		{/each}
	</section>
{:else}
	<main>
		<p>Post not found.</p>
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
