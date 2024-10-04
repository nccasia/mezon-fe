import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		emptyThreadContainer: {
			backgroundColor: colors.primary,
			height: '100%',
			width: '100%',
			position: 'relative'
		},
		emptyThreadContent: {
			position: 'absolute',
			top: '30%',
			left: 10,
			right: 10,
			flexDirection: 'column',
			alignItems: 'center'
		},
		textNoThread: {
			fontSize: size.h5,
			lineHeight: 1.25 * 20,
			fontWeight: '600',
			color: colors.textStrong,
			marginBottom: 8
		},
		textNotify: {
			textAlign: 'center',
			color: colors.textDisabled,
			fontSize: size.label,
			lineHeight: 1.25 * 16,
			fontWeight: '400',
			marginBottom: 8
		},
		button: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: baseColor.blurple,
			borderRadius: 50,
			paddingVertical: 2,
			paddingHorizontal: 16,
			width: 150,
			height: 50,
			marginTop: 20
		},
		buttonText: {
			color: baseColor.white,
			fontSize: size.medium,
			fontWeight: '500',
			lineHeight: 16,
			textAlign: 'center'
		},
		iconContainer: {
			width: 50,
			height: 50,
			borderRadius: 50,
			backgroundColor: colors.secondary,
			marginBottom: 16,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}
	});
