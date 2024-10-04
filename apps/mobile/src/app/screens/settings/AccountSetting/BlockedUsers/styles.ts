import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.primary,
			padding: size.s_14,
			gap: size.s_16,
			justifyContent: 'center',
			alignContent: 'center'
		}
	});
