import { getAllPosts } from '$lib/storyblok';

export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	const tags = new Set();

	posts.forEach((p) => {
		p.content.categories?.forEach((t) => tags.add(t));
	});

	return [...tags].map((tag) => ({ tag }));
}

export async function load({ params }) {
	const posts = await getAllPosts();
	const filtered = posts.filter((p) => p.content.categories?.includes(params.tag));

	return { tag: params.tag, posts: filtered };
}
