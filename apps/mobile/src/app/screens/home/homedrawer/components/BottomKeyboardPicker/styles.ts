import { Attributes } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flex: 1,
			padding: 24,
			backgroundColor: 'grey'
		},
		contentContainer: {
			flex: 1
		}
	});
