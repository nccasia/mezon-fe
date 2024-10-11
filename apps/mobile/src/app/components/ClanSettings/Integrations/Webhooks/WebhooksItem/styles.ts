import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		image: { width: size.s_50, height: size.s_50, borderRadius: size.s_24 },
		textTime: {
			fontSize: size.small,
			color: colors.textDisabled,
			fontWeight: '500'
		},
		name: {
			fontSize: size.label,
			color: colors.white,
			fontWeight: '500'
		}
	});
