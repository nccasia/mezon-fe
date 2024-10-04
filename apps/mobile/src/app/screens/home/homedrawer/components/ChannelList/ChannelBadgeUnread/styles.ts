import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		channelDotWrapper: {
			backgroundColor: baseColor.redStrong,
			height: size.s_18,
			width: size.s_18,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: size.s_18
		},

		channelDot: {
			color: baseColor.white,
			fontSize: size.s_10,
			fontWeight: 'bold'
		}
	});
