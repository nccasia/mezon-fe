import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		btn: {
			borderRadius: size.s_4,
			flex: 1,
			backgroundColor: colors.textDisabled,
			paddingHorizontal: size.s_10,
			paddingVertical: size.s_8,
		},
		textBtn: {
			color: colors.white,
			fontSize: size.label,
			fontWeight: '600',
			textAlign: 'center',
		},
	});
