import { Attributes, Metrics, brandColors } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		googleButton: {
			backgroundColor: 'white',
			paddingVertical: Metrics.size.l,
			marginHorizontal: Metrics.size.xl,
			borderRadius: 4,
			justifyContent: 'center',
			alignItems: 'center'
		},
		// Will fix later
		appleButton: {
			backgroundColor: 'black',
			paddingVertical: 15,
			marginHorizontal: 20,
			borderRadius: 4,
			justifyContent: 'center',
			alignItems: 'center'
		},

		socialButtonsContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center',
			width: '100%',
			gap: Metrics.size.m
		},

		signinButtonLogo: {
			height: 18,
			width: 18
		},
		socialSigninButtonText: {
			color: brandColors.google,
			fontSize: 16,
			lineHeight: 13 * 1.4
		}
	});
