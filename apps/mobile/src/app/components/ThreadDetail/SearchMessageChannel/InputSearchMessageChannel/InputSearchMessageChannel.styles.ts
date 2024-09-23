import { Attributes, Colors, size, verticalScale } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		wrapper: {
			flexDirection: 'row',
			backgroundColor: Colors.transparent,
			alignItems: 'center',
			justifyContent: 'space-between',
			paddingHorizontal: size.s_20,
			gap: size.s_10,
			marginVertical: size.s_10,
			marginBottom: -10
		},
		searchBox: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: colors.primary,
			borderRadius: verticalScale(50),
			flex: 1,
			height: size.s_40,
			paddingHorizontal: size.s_10,
			justifyContent: 'space-between'
		},
		input: {
			color: colors.text,
			flex: 1
		},
		listSearchIcon: {
			backgroundColor: colors.primary,
			opacity: 0.7,
			padding: size.s_10,
			borderRadius: verticalScale(50)
		},
		channelLabel: {
			fontSize: size.label,
			fontWeight: '600',
			color: colors.white
		}
	});
