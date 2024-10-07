import { Attributes, baseColor, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			backgroundColor: colors.secondary,
			padding: Metrics.size.l,
			borderRadius: 10,
			marginBottom: Metrics.size.xl
		},
		title: {
			color: colors.textStrong,
			fontSize: Fonts.size.h8,
			fontWeight: 'bold'
		},
		value: {
			color: colors.textDisabled,
			fontSize: Fonts.size.h8
		},
		header: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'space-between',
			paddingBottom: Metrics.size.l
		},
		thumb: {
			backgroundColor: baseColor.blurple,
			height: 25,
			width: 25,
			borderRadius: 15
		},
		track: {
			backgroundColor: baseColor.gray,
			height: 4
		},
		miniTrack: {
			backgroundColor: baseColor.blurple
		}
	});
