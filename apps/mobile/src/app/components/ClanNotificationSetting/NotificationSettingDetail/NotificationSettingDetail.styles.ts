import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		description: {
			fontSize: size.s_14,
			color: colors.textDisabled,
			fontWeight: '600',
			marginTop: size.s_10
		},
		duration: {
			fontSize: size.s_14,
			color: colors.bgViolet,
			fontWeight: '600'
		},
		resetOverridesBtn: {
			backgroundColor: colors.secondary,
			padding: size.s_16,
			borderRadius: size.s_10
		},
		textBtn: {
			fontSize: size.label,
			fontWeight: '600',
			color: colors.text
		}
	});
