import { getLatestPost } from '$lib/storyblok';

export const prerender = true;

export async function load() {
	const latest = await getLatestPost();
	return { latest };
}
