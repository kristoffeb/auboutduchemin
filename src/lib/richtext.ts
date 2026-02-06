import { richTextResolver } from '@storyblok/richtext';

const { render } = richTextResolver();

export function renderRichText(richtext: any) {
	return render(richtext);
}
