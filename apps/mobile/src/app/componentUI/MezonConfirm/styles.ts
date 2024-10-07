import { Attributes, Colors, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.secondary,
			padding: Metrics.size.xl,
			margin: Metrics.size.l,
			borderRadius: 10,
			overflow: 'hidden'
		},

		title: {
			color: colors.textStrong,
			fontSize: Fonts.size.h7,
			fontWeight: 'bold'
		},

		header: {
			paddingBottom: Metrics.size.m,
			borderBottomColor: colors.border,
			borderBottomWidth: 1,
			marginBottom: Metrics.size.xl
		},

		btnWrapper: {
			display: 'flex',
			gap: Metrics.size.m,
			paddingVertical: Metrics.size.m,
			paddingTop: Metrics.size.xl
		},

		btn: {
			borderRadius: 20,
			padding: Metrics.size.m,
			backgroundColor: colors.primary
		},
		btnDanger: {
			backgroundColor: Colors.red
		},
		btnText: {
			color: colors.textStrong,
			fontSize: Fonts.size.h8,
			textAlign: 'center'
		},

		contentText: {
			color: colors.text,
			fontSize: Fonts.size.h8,
			textAlign: 'center'
		}
	});
