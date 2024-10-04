import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		groupThread: {
			borderRadius: 8,
			overflow: 'hidden'
		},
		title: {
			color: colors.text,
			fontWeight: '600',
			fontSize: size.label,
			marginBottom: size.s_10
		}
	});
