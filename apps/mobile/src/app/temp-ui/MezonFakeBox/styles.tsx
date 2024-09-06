import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		box: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			backgroundColor: colors.secondary,
			gap: Metrics.size.l,
			paddingHorizontal: Metrics.size.m,
			paddingVertical: Metrics.size.l,
			borderRadius: 10
		},
		textBox: {
			color: colors.textStrong,
			flex: 1,
			flexGrow: 1,
			flexBasis: 10,
			fontSize: Fonts.size.h7
		},

		sectionTitle: {
			color: colors.textStrong,
			fontSize: Fonts.size.small,
			fontWeight: '600',
			marginBottom: Fonts.size.s_10
		},
		titleUppercase: {
			fontSize: Fonts.size.h7,
			textTransform: 'uppercase'
		}
	});
