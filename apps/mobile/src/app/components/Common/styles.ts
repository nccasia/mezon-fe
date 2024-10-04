import { Attributes } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		line: {
			height: 1.5,
			width: '100%',
			backgroundColor: colors.tertiary
		}
	});
