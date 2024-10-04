import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		input: {
			height: 36,
			flex: 1,
			color: colors.text
		},
		categoryItem: {
			paddingVertical: size.s_14,
			borderBottomWidth: 0
		}
	});
