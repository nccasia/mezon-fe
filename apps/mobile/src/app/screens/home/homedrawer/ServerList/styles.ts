import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		wrapperServerList: {
			paddingTop: size.s_20,
			flex: 1
		},

		badge: {
			backgroundColor: Colors.red,
			position: 'absolute',
			borderRadius: size.s_14,
			borderWidth: size.s_4,
			borderColor: Colors.secondary,
			minWidth: size.s_22,
			height: size.s_22,
			alignItems: 'center',
			justifyContent: 'center',
			bottom: -size.s_4,
			right: -size.s_4,
		},

		badgeText: {
			color: Colors.white,
			fontWeight: 'bold',
			fontSize: size.small,
		},
		wrapperPlusClan: {
			marginTop: verticalScale(5),
			height: verticalScale(50),
			width: verticalScale(50),
			borderRadius: 50,
			overflow: 'hidden',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.secondary,
		},
		contentScroll: { alignItems: 'center', paddingBottom: size.s_20 },
		separatorLine: { width: '60%', marginTop: size.s_10, alignSelf: 'center' },
	});
