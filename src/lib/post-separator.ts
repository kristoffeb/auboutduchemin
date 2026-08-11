type PostWithSeparatorSeed = {
	slug?: unknown;
	content?: {
		title?: unknown;
	};
};

export const separatorIconCount = 12;

export function hashString(input: string) {
	let hash = 0;
	for (let index = 0; index < input.length; index += 1) {
		hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
	}
	return hash;
}

export function buildSeparatorSeed(post: PostWithSeparatorSeed | null | undefined) {
	return `${String(post?.slug ?? '')}:${String(post?.content?.title ?? '')}`;
}

export function getSeparatorBaseIndex(seed: string) {
	const normalizedSeed = seed.trim() || 'separator-default';
	return hashString(normalizedSeed) % separatorIconCount;
}

export function buildNonRepeatingSeparatorIndices(posts: PostWithSeparatorSeed[]) {
	const iconIndices: number[] = [];
	let previousIndex = -1;

	for (const post of posts) {
		let nextIndex = getSeparatorBaseIndex(buildSeparatorSeed(post));
		if (nextIndex === previousIndex) {
			nextIndex = (nextIndex + 1) % separatorIconCount;
		}
		iconIndices.push(nextIndex);
		previousIndex = nextIndex;
	}

	return iconIndices;
}
