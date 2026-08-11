import { getStoryByPath } from '$lib/storyblok';

export const prerender = true;

export async function load() {
	const aboutPage = await getStoryByPath('/pages/about');
	return { aboutPage };
}
