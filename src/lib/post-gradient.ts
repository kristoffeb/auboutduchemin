import { buildSeparatorSeed, hashString } from '$lib/post-separator';

type PostWithGradientSeed = {
	slug?: unknown;
	content?: {
		title?: unknown;
	};
};

export const basePostGradientEndColor = '#9ccc65';

const postGradientShadeDelta = 0.1;

function clampRgbChannel(value: number) {
	return Math.max(0, Math.min(255, Math.round(value)));
}

function parseHexColor(hexColor: string) {
	const normalizedHex = hexColor.trim().replace('#', '');
	const expandedHex =
		normalizedHex.length === 3
			? normalizedHex
					.split('')
					.map((value) => `${value}${value}`)
					.join('')
			: normalizedHex;

	if (expandedHex.length !== 6) {
		throw new Error(`Unsupported hex color: ${hexColor}`);
	}

	return [
		Number.parseInt(expandedHex.slice(0, 2), 16),
		Number.parseInt(expandedHex.slice(2, 4), 16),
		Number.parseInt(expandedHex.slice(4, 6), 16)
	];
}

function formatHexColor([red, green, blue]: number[]) {
	return `#${[red, green, blue]
		.map((channel) => clampRgbChannel(channel).toString(16).padStart(2, '0'))
		.join('')}`;
}

function adjustHexColorShade(baseHexColor: string, shadeOffset: number) {
	const [red, green, blue] = parseHexColor(baseHexColor);
	const mixTarget = shadeOffset >= 0 ? 255 : 0;
	const mixAmount = Math.abs(shadeOffset);

	return formatHexColor([
		red + (mixTarget - red) * mixAmount,
		green + (mixTarget - green) * mixAmount,
		blue + (mixTarget - blue) * mixAmount
	]);
}

export function getPostGradientEndColor(post: PostWithGradientSeed | null | undefined) {
	const seed = buildSeparatorSeed(post).trim() || 'post-gradient-default';
	const normalizedHash = hashString(seed) / 0xffffffff;
	const shadeOffset = (normalizedHash * 2 - 1) * postGradientShadeDelta;

	return adjustHexColorShade(basePostGradientEndColor, shadeOffset);
}
