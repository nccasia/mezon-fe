import { Attributes, Fonts, Metrics, baseColor } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		signupContainer: {
			marginHorizontal: Metrics.size.xl,
			justifyContent: 'center',
			paddingVertical: Metrics.size.xl,
			flexDirection: 'row',
			alignItems: 'center'
		},
		accountText: {
			fontSize: Fonts.size.h7,
			lineHeight: 13 * 1.4,
			color: colors.text
		},
		signupText: {
			fontSize: Fonts.size.h7,
			lineHeight: 13 * 1.4,
			color: baseColor.blurple,
			marginLeft: Metrics.size.s
		}
	});
