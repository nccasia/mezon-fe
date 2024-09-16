import { Attributes, Fonts, Metrics, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		channelListLink: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingRight: Metrics.size.l
		},

		channelListItemActive: {
			borderRadius: size.s_10
			// borderWidth: 1,
			// borderColor: colors.border
		},

		channelListItem: {
			paddingHorizontal: Metrics.size.m,
			flexDirection: 'row',
			alignItems: 'center',
			paddingVertical: 8,
			borderRadius: 5,
			flex: 1
		},

		dotIsNew: {
			position: 'absolute',
			left: -10,
			width: size.s_6,
			height: size.s_6,
			borderRadius: size.s_6,
			backgroundColor: colors.textStrong
		},

		channelListItemTitle: {
			fontSize: size.s_14,
			fontWeight: '600',
			marginLeft: size.s_6,
			color: colors.channelNormal
		},

		channelListItemTitleActive: {
			color: colors.white
		},

		channelDotWrapper: {
			backgroundColor: baseColor.red,
			height: 20,
			width: 20,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 10
		},

		channelDot: {
			color: baseColor.white,
			fontSize: Fonts.size.h8
		}
	});
