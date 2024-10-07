import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		iconWrapper: {
			display: 'flex',
			justifyContent: 'center',
			alignContent: 'center',
			padding: Metrics.size.m,
			backgroundColor: colors.secondary,
			borderWidth: 1,
			borderColor: colors.borderDim,
			borderRadius: 999
		},

		container: {
			gap: Metrics.size.m,
			alignItems: 'center'
		},

		title: {
			color: colors.textStrong,
			fontSize: Fonts.size.tiny
		}
	});
