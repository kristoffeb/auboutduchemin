import { getAllPosts, getPost } from '$lib/storyblok';

export const prerender = true;

export async function entries() {
	const posts = await getAllPosts();
	return posts.map((post) => ({ slug: post.slug }));
}

export async function load({ params }) {
	const post = await getPost(params.slug);
	return { post };
}
