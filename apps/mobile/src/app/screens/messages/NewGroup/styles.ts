import { Attributes, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		newGroupContainer: {
			backgroundColor: colors.primary,
			flex: 1
		},
		contentWrapper: {
			flex: 1,
			padding: size.s_18
		},
		headerWrapper: {
			flexDirection: 'row',
			padding: size.s_14,
			gap: size.s_14,
			alignItems: 'center',
			backgroundColor: colors.secondary
		},
		screenTitleWrapper: {
			flex: 1,
			alignItems: 'center'
		},
		screenTitle: {
			color: colors.text,
			fontSize: size.h6
		},
		actions: {
			flexDirection: 'row',
			gap: size.s_20
		},
		actionText: {
			color: Colors.textViolet,
			fontSize: size.label
		},
		searchFriend: {
			backgroundColor: colors.secondary,
			borderRadius: 40,
			alignItems: 'center',
			paddingHorizontal: size.s_12,
			flexDirection: 'row'
		},
		searchInput: {
			width: '93%',
			borderRadius: 20,
			color: colors.textStrong,
			paddingVertical: size.s_6,
			marginLeft: 5
		}
	});
