import { Attributes, Fonts } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.secondary,
			marginHorizontal: 20,
			borderRadius: 10,
			marginTop: 20,
			padding: 20
		},

		name: {
			color: colors.textStrong,
			fontWeight: '700',
			fontSize: Fonts.size.h5
		},

		username: {
			color: colors.text,
			fontSize: Fonts.size.small
		},

		nameWrapper: {
			marginBottom: 20
		}
	});
