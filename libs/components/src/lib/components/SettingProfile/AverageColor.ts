import { FastAverageColor } from 'fast-average-color';

export const getColorAverageFromURL = async (url: string) => {
	try {
		const fac = new FastAverageColor();
		const color = await fac.getColorAsync(url);
		if (color.error) return '';
		return color.hex;
	} catch (error) {
		return '';
	}
};
