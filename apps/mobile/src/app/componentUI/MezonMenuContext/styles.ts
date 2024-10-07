import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.secondary,
			minWidth: 220,
			padding: 0,
			borderColor: colors.border,
			borderWidth: 1,
			borderRadius: size.s_10
		},
		arrow: {
			height: 0,
			width: 0
		}
	});
