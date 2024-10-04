import { Attributes } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		logoContainer: {
			position: 'relative'
		},

		logoSection: {
			paddingVertical: 40,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},

		clanName: {
			color: colors.textStrong,
			fontSize: 14,
			marginTop: 10
		}
	});
