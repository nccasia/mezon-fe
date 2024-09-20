import { nativeImage } from 'electron';
import sharp from 'sharp';

export class BadgeIconGenerator {
	async generate(badgeNumber: number): Promise<Electron.NativeImage> {
		const svgString =
			badgeNumber <= 9
				? `<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg">
						<circle cx="160" cy="160" r="160" fill="red" />
						<text x="160" y="230" font-size="200" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">${badgeNumber}</text>
					</svg>`
				: `<svg width="400" height="320" xmlns="http://www.w3.org/2000/svg">
						<rect width="100%" height="100%" rx="140" fill="red" />
						<text x="200" y="220" font-size="200" font-weight="bold" text-anchor="middle" fill="white" font-family="Arial">9+</text>
					</svg>`;

		const svgBuffer = Buffer.from(svgString);
		const pngBuffer = await sharp(svgBuffer).png().toBuffer();
		return nativeImage.createFromBuffer(pngBuffer);
	}
}
