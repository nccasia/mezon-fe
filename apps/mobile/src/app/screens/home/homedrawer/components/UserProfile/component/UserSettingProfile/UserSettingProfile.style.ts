import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		wrapper: {
			borderColor: colors.border,
			borderWidth: 0.8,
			borderRadius: size.s_10,
			paddingHorizontal: size.s_10,
			marginVertical: size.s_16
		},
		option: {
			flexDirection: 'row',
			paddingHorizontal: size.s_6,
			paddingVertical: size.s_14,
			gap: size.s_20
		},
		textOption: {
			color: colors.text,
			fontSize: size.label,
			fontWeight: '700'
		}
	});
