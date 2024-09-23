import { Attributes, Metrics, baseColor, size } from '@mezon/mobile-ui';
import { Platform, StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		channelListLink: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingRight: Metrics.size.l
		},

		threadItem: {
			flexDirection: 'row',
			flexGrow: 1,
			alignItems: 'flex-end'
		},

		threadItemActive: {
			backgroundColor: colors.secondaryLight,
			borderRadius: size.s_10,
			// borderWidth: 0.4,
			// borderColor: Colors.gray48,
			position: 'absolute',
			width: '95%',
			height: Platform.OS === 'android' ? '90%' : '95%',
			right: 0,
			top: Platform.OS === 'android' ? size.s_18 : size.s_14
		},

		titleThread: {
			flex: 1,
			fontSize: size.s_14,
			fontWeight: '600',
			marginLeft: size.s_6,
			color: colors.channelNormal,
			top: size.s_6
		},

		channelListItemTitleActive: {
			color: colors.channelUnread
		},

		threadFirstItemActive: {
			height: '160%',
			right: 0,
			top: size.s_2,
			backgroundColor: colors.secondaryLight,
			borderRadius: size.s_10
			// borderWidth: 0.4,
			// borderColor: Colors.gray48
		},

		channelDotWrapper: {
			backgroundColor: baseColor.redStrong,
			height: size.s_18,
			width: size.s_18,
			right: size.s_18,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: size.s_18,
			top: Platform.OS === 'android' ? size.s_18 : size.s_14
		},

		channelDot: {
			color: baseColor.white,
			fontSize: size.s_10,
			fontWeight: 'bold'
		}
	});
