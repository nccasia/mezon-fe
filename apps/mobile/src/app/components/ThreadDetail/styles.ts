import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		createChannelContainer: {
			backgroundColor: colors.primary,
			height: '100%',
			width: '100%',
			paddingHorizontal: size.s_12,
			paddingVertical: size.s_16
		}
	});
