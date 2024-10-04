import { Attributes, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: colors.primary,
			justifyContent: 'center'
		},
		headerContainer: {
			alignItems: 'center',
			paddingVertical: Metrics.size.m,
			paddingHorizontal: Metrics.size.xl
		},
		headerTitle: {
			fontSize: 38,
			textAlign: 'center',
			color: colors.textStrong
		},
		headerContent: {
			fontSize: 16,
			lineHeight: 20 * 1.4,
			textAlign: 'center',
			color: colors.text
		},

		signupContainer: {
			marginHorizontal: Metrics.size.xl,
			justifyContent: 'center',
			paddingVertical: Metrics.size.xl,
			flexDirection: 'row',
			alignItems: 'center'
		}
	});
