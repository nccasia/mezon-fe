import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		wrapperClanIcon: {
			alignItems: 'center',
			marginTop: size.s_10
		},

		clanIcon: {
			height: verticalScale(50),
			width: verticalScale(50),
			borderRadius: verticalScale(50),
			overflow: 'hidden',
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.black
		},

		textLogoClanIcon: {
			color: colors.white,
			fontSize: size.s_22,
			fontWeight: '400'
		},

		logoClan: {
			height: verticalScale(50),
			width: verticalScale(50),
			borderRadius: verticalScale(50),
			resizeMode: 'cover'
		},

		logoClanActive: {
			borderRadius: verticalScale(15)
		},

		clanIconActive: {
			backgroundColor: colors.secondary,
			borderRadius: verticalScale(15)
		},
		lineActiveClan: {
			backgroundColor: Colors.azureBlue,
			width: size.s_6,
			height: '80%',
			top: '10%',
			left: -13,
			borderTopRightRadius: 10,
			borderBottomEndRadius: 10,
			position: 'absolute'
		},
		badge: {
			backgroundColor: Colors.red,
			position: 'absolute',
			borderRadius: size.s_14,
			borderWidth: 3,
			borderColor: Colors.secondary,
			minWidth: size.s_22,
			height: size.s_22,
			alignItems: 'center',
			justifyContent: 'center',
			bottom: -3,
			right: -5
		},
		badgeText: {
			color: Colors.white,
			fontWeight: 'bold',
			fontSize: size.small
		}
	});
