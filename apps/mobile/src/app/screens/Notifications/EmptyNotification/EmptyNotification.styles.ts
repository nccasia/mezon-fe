import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		title: {
			fontSize: size.regular,
			fontWeight: '600',
			color: colors.white
		},
		description: {
			fontSize: size.label,
			fontWeight: '400',
			color: colors.text,
			textAlign: 'center'
		}
	});
