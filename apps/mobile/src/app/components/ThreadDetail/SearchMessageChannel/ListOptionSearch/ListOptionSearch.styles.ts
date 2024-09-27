import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		optionSearchContainer: {
			backgroundColor: colors.primary
		},
		headerTitle: {
			color: colors.text,
			fontSize: size.label,
			fontWeight: '600',
			height: size.s_50,
			borderBottomColor: colors.border,
			borderBottomWidth: 4,
			paddingHorizontal: size.s_10,
			paddingVertical: size.s_10
		}
	});
