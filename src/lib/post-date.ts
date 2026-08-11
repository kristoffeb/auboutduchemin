const postDatePrefixes = ['Écrit', 'Imaginé', 'Rêvé', 'Joué', 'Sublimé', 'Ressenti'] as const;

type PostDateSource = {
	slug?: unknown;
	uuid?: unknown;
	id?: unknown;
	first_published_at?: unknown;
	published_at?: unknown;
	created_at?: unknown;
};

function hashString(value: string) {
	let hash = 0;

	for (let index = 0; index < value.length; index += 1) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
	}

	return hash;
}

function getPostDateValue(post: PostDateSource) {
	const rawDate = post.first_published_at ?? post.published_at ?? post.created_at;
	return typeof rawDate === 'string' ? rawDate.trim() : '';
}

function getPostDatePrefix(post: PostDateSource) {
	const identity = String(post.slug ?? post.uuid ?? post.id ?? '');
	return postDatePrefixes[hashString(identity) % postDatePrefixes.length];
}

export function formatPostDateLabel(post: PostDateSource) {
	const rawDate = getPostDateValue(post);
	if (!rawDate) return '';

	const parsedDate = new Date(rawDate);
	if (Number.isNaN(parsedDate.getTime())) return '';

	const formattedDate = new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	}).format(parsedDate);

	return `${getPostDatePrefix(post)} le ${formattedDate}`;
}
