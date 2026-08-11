import { env as envPrivate } from '$env/dynamic/private';

const API = 'https://api.storyblok.com/v2/cdn';
const STORYBLOK_TIMEOUT_MS = 8000;

type StoryblokListResponse = { stories?: Array<any> };
type StoryblokSingleResponse = { story?: any };

function getStoryblokToken() {
	return envPrivate.STORYBLOK_TOKEN?.trim();
}

async function fetchJson(url: string) {
	const controller = new AbortController();
	const timeoutHandle = setTimeout(() => controller.abort(), STORYBLOK_TIMEOUT_MS);

	try {
		const res = await fetch(url, { signal: controller.signal });
		if (!res.ok) throw new Error(`Storyblok error: ${res.status}`);
		return res.json();
	} finally {
		clearTimeout(timeoutHandle);
	}
}

export async function getLatestPost() {
	const token = getStoryblokToken();
	if (!token) return null;

	const url =
		`${API}/stories?token=${token}` +
		`&starts_with=blog/` +
		`&sort_by=first_published_at:desc` +
		`&per_page=1`;

	try {
		const data = (await fetchJson(url)) as StoryblokListResponse;
		return data.stories?.[0] ?? null;
	} catch (error) {
		console.error('Failed to fetch latest post from Storyblok', error);
		return null;
	}
}

export async function getAllPosts() {
	const token = getStoryblokToken();
	if (!token) return [];

	const url =
		`${API}/stories?token=${token}` +
		`&starts_with=blog/` +
		`&sort_by=first_published_at:desc` +
		`&per_page=100`;

	try {
		const data = (await fetchJson(url)) as StoryblokListResponse;
		return data.stories ?? [];
	} catch (error) {
		console.error('Failed to fetch posts from Storyblok', error);
		return [];
	}
}

export async function getPost(slug: string) {
	const token = getStoryblokToken();
	if (!token) return null;

	const url = `${API}/stories/blog/${slug}?token=${token}`;

	try {
		const data = (await fetchJson(url)) as StoryblokSingleResponse;
		return data.story ?? null;
	} catch (error) {
		console.error(`Failed to fetch post for slug '${slug}' from Storyblok`, error);
		return null;
	}
}

export async function getStoryByPath(path: string) {
	const token = getStoryblokToken();
	if (!token) return null;

	const normalizedPath = path.trim().replace(/^\/+|\/+$/g, '');
	if (!normalizedPath) return null;

	const url = `${API}/stories/${normalizedPath}?token=${token}`;

	try {
		const data = (await fetchJson(url)) as StoryblokSingleResponse;
		return data.story ?? null;
	} catch (error) {
		console.error(`Failed to fetch story for path '${normalizedPath}' from Storyblok`, error);
		return null;
	}
}
