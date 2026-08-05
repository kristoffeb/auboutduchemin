import { richTextResolver } from '@storyblok/richtext';

const { render } = richTextResolver();

function escapeHtml(value: string) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function renderRichTextMarkup(richtext: unknown) {
	if (typeof richtext === 'string') {
		return escapeHtml(richtext).replace(/\r\n|\r|\n/g, '<br />');
	}

	if (!richtext) {
		return '';
	}

	return render(richtext);
}

export function renderRichTextText(richtext: unknown) {
	return renderRichTextMarkup(richtext)
		.replace(/<br\s*\/?>/gi, '\n')
		.replace(/<\/p>\s*<p>/gi, '\n\n')
		.replace(/<\/?p>/gi, '')
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.trim();
}
