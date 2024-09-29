import { ThemeModeBase } from '../hooks/useTheme';

export type HexColor = `#${string}`;
type Colors = { [key: string]: HexColor };
export type Attributes = {
	primary: HexColor;
	secondary: HexColor;
	secondaryWeight: HexColor;
	secondaryLight: HexColor;
	tertiary: HexColor;
	border: HexColor;
	borderDim: HexColor;
	borderHighlight: HexColor;
	borderRadio: HexColor;
	text: HexColor;
	textStrong: HexColor;
	textDisabled: HexColor;
	textNormal: HexColor;
	white: HexColor;
	black: HexColor;
	bgInputPrimary: HexColor;
	charcoal: HexColor;
	jet: HexColor;
	channelUnread: HexColor;
	channelNormal: HexColor;
	midnightBlue: HexColor;
	textLink: HexColor;
	reactionBg: HexColor;
	reactionBorder: HexColor;
	selectedOverlay: HexColor;
	bgViolet: HexColor;
	colorAvatarDefault: HexColor;
	colorActiveClan: HexColor;
	textRoleLink: HexColor;
	darkMossGreen: HexColor;
	badgeHighlight: HexColor;
};

type ThemeColor = Record<ThemeModeBase, Attributes>;

export const baseColor = {
	blurple: '#5e65de',
	white: '#ffffff',
	black: '#000000',
	red: '#e67b7c',
	redStrong: '#E53935',
	purple: '#fc74fc',
	green: '#42a869',
	gray: '#949AA4',
	flamingo: '#f23f43'
} satisfies Colors;

export const brandColors = {
	google: '#155EEF'
} satisfies Colors;

export const themeColors: ThemeColor = {
	dark: {
		primary: '#1c1d22',
		secondary: '#242427',
		tertiary: '#141319',
		border: '#2e2f34',
		borderHighlight: '#27272f',
		borderDim: '#2f2f37',
		borderRadio: '#cacad2',
		text: '#CCCCCC',
		textStrong: '#dfe0e4',
		textDisabled: '#7b7b83',
		textNormal: '#898993',
		secondaryWeight: '#212122',
		secondaryLight: '#2A2D31',
		white: '#FFFFFF',
		black: '#000000',
		bgInputPrimary: '#2a2e31',
		charcoal: '#2b2b2e',
		jet: '#29292b',
		channelUnread: '#ffffff',
		channelNormal: '#aeaeae',
		midnightBlue: '#3b426e',
		textLink: '#3297ff',
		reactionBg: '#373a54',
		reactionBorder: '#2563eb',
		selectedOverlay: '#00000096',
		bgViolet: '#5a62f4',
		colorAvatarDefault: '#334155FF',
		colorActiveClan: '#141c2a',
		textRoleLink: '#009c67',
		darkMossGreen: '#3c4c43',
		badgeHighlight: '#2e2f34'
	},
	light: {
		primary: '#f2f3f5',
		secondary: '#ffffff',
		tertiary: '#ecedef',
		border: '#cbccce',
		borderHighlight: '#e0e1e3',
		borderDim: '#f4f4f4',
		borderRadio: '#4d4d54',
		text: '#5d5c64',
		textStrong: '#070709',
		textDisabled: '#a0a1a6',
		textNormal: '#e0e1e3',
		secondaryWeight: '#F0F0F0',
		secondaryLight: '#ffffff',
		white: '#000000',
		black: '#FFFFFF',
		bgInputPrimary: '#a0a1a6',
		charcoal: '#f2f3f5',
		jet: '#ecedef',
		channelUnread: '#000000',
		channelNormal: '#6c7077',
		midnightBlue: '#d1e0ff',
		textLink: '#3297ff',
		reactionBg: '#e5e7eb',
		reactionBorder: '#2563eb',
		selectedOverlay: '#FFFFFF96',
		bgViolet: '#5a62f4',
		colorAvatarDefault: '#334155FF',
		colorActiveClan: '#d8e2f0',
		textRoleLink: '#00b098',
		darkMossGreen: '#e2f1e5',
		badgeHighlight: '#fff'
	}
};
