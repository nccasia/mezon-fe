import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		description: {
			fontSize: size.s_14,
			color: colors.textDisabled,
			fontWeight: '400',
			marginBottom: size.s_10
		},
		textLink: {
			fontSize: size.s_14,
			color: colors.textLink,
			fontWeight: '400'
		}
	});
