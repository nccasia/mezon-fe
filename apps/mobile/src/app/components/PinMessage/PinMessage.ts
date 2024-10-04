import { Attributes, size } from '@mezon/mobile-ui';
import { Dimensions, StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		containerPinMessage: {
			width: Dimensions.get('screen').width,
			paddingHorizontal: size.s_12,
			paddingBottom: size.s_16
		}
	});
