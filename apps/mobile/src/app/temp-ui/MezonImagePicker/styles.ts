import { Attributes, Fonts } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		bannerWrapper: {
			borderRadius: 20,
			overflow: 'hidden',
			backgroundColor: colors.tertiary,
			borderWidth: 1,
			borderColor: colors.border,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},

		bannerContainer: {
			position: 'relative'
		},

		btnWrapper: {
			position: 'absolute',
			top: -7,
			right: -7,
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
			alignItems: 'center',
			padding: 7,
			borderRadius: 50,
			backgroundColor: colors.secondary
		},

		textPlaceholder: {
			color: colors.textDisabled,
			fontSize: Fonts.size.h6
		},
		image: {
			height: '100%',
			width: '100%'
		}
	});
