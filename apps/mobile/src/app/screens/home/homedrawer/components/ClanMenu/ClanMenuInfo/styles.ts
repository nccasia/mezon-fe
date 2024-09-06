import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		info: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Metrics.size.l,
			justifyContent: 'flex-start'
		},

		inlineInfo: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: Metrics.size.s
		},

		inlineText: {
			fontSize: Fonts.size.small,
			color: colors.text
		}
	});
