import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		addFriendContainer: {
			backgroundColor: colors.primary,
			flex: 1,
			padding: size.s_18,
			gap: size.s_18
		},
		groupWrapper: {
			borderRadius: size.s_12,
			overflow: 'hidden'
		},
		whiteText: {
			color: colors.text,
			fontSize: size.medium
		},
		addFriendItem: {
			padding: size.s_10,
			backgroundColor: colors.secondary
		},
		addFriendText: {
			color: colors.textStrong,
			fontSize: size.medium
		}
	});
