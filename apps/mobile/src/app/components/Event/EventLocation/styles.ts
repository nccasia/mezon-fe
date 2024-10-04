import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			gap: Metrics.size.s
		},

		inline: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'flex-start',
			flexDirection: 'row',
			gap: Metrics.size.s
		},

		tinyText: {
			color: colors.text,
			fontSize: Fonts.size.tiny
		},

		smallText: {
			color: colors.text,
			fontSize: Fonts.size.h8
		}
	});
