import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		channelListSection: {
			width: '100%',
			paddingHorizontal: size.s_8,
			marginBottom: size.s_10
		}
	});
