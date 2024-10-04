import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		settingFriendRequestContainer: {
			backgroundColor: colors.primary,
			flex: 1,
			padding: size.s_18
		}
	});
