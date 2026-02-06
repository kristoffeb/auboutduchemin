import { env as envPrivate } from '$env/dynamic/private';

const API = 'https://api.storyblok.com/v2/cdn';

async function fetchJson(url: string) {
	const res = await fetch(url);
	if (!res.ok) throw new Error('Storyblok error');
	return res.json();
}

export async function getLatestPost() {
	const url =
		`${API}/stories?token=${envPrivate.STORYBLOK_TOKEN}` +
		`&starts_with=blog/` +
		`&sort_by=first_published_at:desc` +
		`&per_page=1`;

	const data = await fetchJson(url);
	return data.stories?.[0];
}

export async function getAllPosts() {
	const url =
		`${API}/stories?token=${envPrivate.STORYBLOK_TOKEN}` +
		`&starts_with=blog/` +
		`&sort_by=first_published_at:desc` +
		`&per_page=100`;

	const data = await fetchJson(url);
	return data.stories ?? [];
}

export async function getPost(slug: string) {
	const url = `${API}/stories/blog/${slug}?token=${envPrivate.STORYBLOK_TOKEN}`;

	const data = await fetchJson(url);
	return data.story;
}
