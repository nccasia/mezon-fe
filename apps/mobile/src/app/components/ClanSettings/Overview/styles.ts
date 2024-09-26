import { Attributes, baseColor, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		headerActionTitle: {
			color: baseColor.blurple,
			fontWeight: 'bold',
			paddingHorizontal: 20
		},
		container: {
			paddingHorizontal: 20,
			paddingVertical: 10,
			backgroundColor: colors.primary
		},
		errorInput: {
			paddingHorizontal: Metrics.size.m
		}
	});
