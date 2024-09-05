import { Attributes, baseColor, Colors, Fonts, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			padding: Metrics.size.m,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'center',
			borderRadius: size.s_10,
			overflow: 'hidden',
			borderWidth: 1,
			backgroundColor: colors.primary,
			gap: size.s_6,
			alignItems: 'center',
			borderColor: colors.border
		},

		rounded: {
			borderRadius: size.s_20
		},

		containerSuccess: {
			backgroundColor: Colors.green
		},

		containerWarning: {
			backgroundColor: Colors.green
		},

		containerDanger: {
			backgroundColor: Colors.green
		},

		containerTheme: {
			backgroundColor: colors.secondary
		},

		containerMd: {
			padding: size.s_12
		},

		containerLg: {
			padding: size.s_16
		},

		fluid: {
			flexBasis: 10,
			flexGrow: 1
		},

		border: {
			backgroundColor: 'transparent'
		},

		title: {
			color: baseColor.white,
			fontSize: Fonts.size.h7,
			textAlign: 'center',
			width: 'auto'
		}
	});
