<script lang="ts">
	import { renderRichText } from '$lib/richtext';
	import Mp3TrackPlayer from '$lib/components/Mp3TrackPlayer.svelte';

	export let data;

	const postObject = data.post;
	const postContent = postObject?.content ?? {};

	const renderedRichTextHtml = postContent.text ? renderRichText(postContent.text) : '';

	const categoriesArray = Array.isArray(postContent.categories) ? postContent.categories : [];

	const externalLinksArray = Array.isArray(postContent.external_links)
		? postContent.external_links
		: [];

	const artistNameString = String(postContent.artist ?? '');
	const songTitleString = String(postContent.song ?? '');
	const mp3UrlString = String(postContent.mp3_file?.filename ?? '');

	console.log(artistNameString, songTitleString, mp3UrlString);
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
	<p class="backLink">
		<a href="/">← Home</a>
	</p>

	<h1 class="postTitle">{postContent.title}</h1>

	{#if postContent.cover?.filename}
		<section class="heroSection">
			<img class="heroImage" src={postContent.cover.filename} alt={postContent.title} />
			<div class="heroOverlayArtist">
				{artistNameString}
			</div>
		</section>
	{/if}

	{#if artistNameString && songTitleString && mp3UrlString}
		<section class="spotifyPlayerSection">
			<div class="spotifyAccentBar"></div>

			<Mp3TrackPlayer {artistNameString} {songTitleString} {mp3UrlString} />
		</section>
	{/if}

	{#if categoriesArray.length > 0}
		<div class="tagsContainer">
			{#each categoriesArray as categoryName}
				<a class="tagLink" href={'/tag/' + encodeURIComponent(categoryName)}>
					{categoryName}
				</a>
			{/each}
		</div>
	{/if}

	{#if postContent.meta_description}
		<p class="metadataLine">
			{postContent.meta_description}
		</p>
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
