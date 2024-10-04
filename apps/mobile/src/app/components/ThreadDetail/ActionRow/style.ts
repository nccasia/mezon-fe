import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 30,
			flex: 0,
			paddingTop: Metrics.size.xl
		},

		optionText: {
			color: colors.text,
			fontFamily: 'bold',
			fontSize: Fonts.size.medium,
			marginTop: Metrics.size.m
		},

		iconWrapper: {
			backgroundColor: colors.primary,
			padding: 15,
			borderRadius: 50
		},

		iconBtn: {
			flexDirection: 'column',
			alignItems: 'center'
		}
	});
