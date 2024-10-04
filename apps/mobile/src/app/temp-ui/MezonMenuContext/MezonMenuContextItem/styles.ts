import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			padding: size.s_10
			// minHeight: 100
		},
		title: {
			color: colors.text
		},
		border: {
			borderBottomColor: colors.borderDim,
			borderBottomWidth: 1
		},
		header: {
			borderBottomColor: colors.borderDim,
			borderBottomWidth: 3
		},
		textHeader: {
			fontWeight: 'bold'
		}
	});
