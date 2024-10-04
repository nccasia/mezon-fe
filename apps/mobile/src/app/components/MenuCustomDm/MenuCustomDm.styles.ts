import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		label: {
			fontSize: size.label,
			fontWeight: '600',
			color: colors.text
		},
		headerCustomGroup: {
			fontSize: size.regular,
			fontWeight: '600',
			color: colors.white,
			textAlign: 'center'
		},
		labelInput: {
			fontSize: size.label,
			fontWeight: '400',
			color: colors.text,
			marginBottom: size.s_20
		}
	});

export default style;
