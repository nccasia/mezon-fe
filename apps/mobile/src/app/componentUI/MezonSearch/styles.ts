import { Attributes, Fonts, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Metrics.size.l
		},

		inputWrapper: {
			borderRadius: size.s_10,
			paddingHorizontal: Metrics.size.l,
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			gap: Metrics.size.m,
			flex: 1
		},

		input: {
			color: colors.textStrong,
			fontSize: Fonts.size.small,
			height: size.s_40,
			flexBasis: 10,
			flexGrow: 1,
			paddingVertical: 0
		},

		textCancel: {
			color: colors.bgViolet
		}
	});
