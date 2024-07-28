import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		typingLabel: {
			paddingHorizontal: size.s_14,
			paddingVertical: size.s_6,
			fontSize: size.s_14,
			color: colors.text
		},
	});
