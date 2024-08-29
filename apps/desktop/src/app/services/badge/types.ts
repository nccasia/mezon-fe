export interface IBadge {
	setBadgeCount(badgeNumber: number): void;
	initListeners(): void;
}

export interface BadgeIconStyle {
	fontColor: string;
	font: string;
	color: string;
	fit: boolean;
	decimals: number;
	radius: number;
}

export interface BadgeOptions {
	iconStyle?: BadgeIconStyle;
}

export interface BadgeIconElement extends HTMLCanvasElement {
	ctx: CanvasRenderingContext2D | null;
	radius: number;
	count: number;
	displayStyle: BadgeIconStyle;
	draw: () => BadgeIconElement;
}
