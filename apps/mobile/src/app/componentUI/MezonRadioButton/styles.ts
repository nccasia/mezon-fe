import { Attributes, Metrics, baseColor } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		outer: {
			borderRadius: 999,
			borderWidth: 2,
			padding: 5,
			height: 24,
			width: 24,
			borderColor: colors.borderRadio
		},

		inner: {
			borderRadius: 10,
			overflow: 'hidden',
			height: '100%',
			width: '100%'
		},

		innerChecked: {
			backgroundColor: baseColor.white
		},

		outerChecked: {
			borderColor: baseColor.blurple,
			backgroundColor: baseColor.blurple
		},

		container: {
			padding: Metrics.size.s
		}
	});
