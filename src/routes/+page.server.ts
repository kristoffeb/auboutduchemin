import { getAllPosts } from '$lib/storyblok';

export const prerender = true;

export async function load() {
	const posts = await getAllPosts();
	return { posts };
}
