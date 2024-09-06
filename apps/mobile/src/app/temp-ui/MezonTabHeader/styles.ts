import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		switchContainer: {
			display: 'flex',
			flexDirection: 'row',
			backgroundColor: colors.tertiary,
			borderRadius: 50,
			margin: size.s_10,
			padding: size.s_4,
			gap: size.s_10
		},

		switchWrapper: {
			flex: 1
		},

		switchButton: {
			borderRadius: 50,
			padding: 5,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},

		switchButtonActive: {
			backgroundColor: baseColor.blurple
		},

		switchText: {
			color: colors.text,
			fontSize: size.medium
		},

		switchTextActive: {
			color: baseColor.white
		}
	});
