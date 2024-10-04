import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		settingContainer: {
			backgroundColor: colors.primary,
			flex: 1
		},
		settingScroll: {
			padding: size.s_20
		}
	});
