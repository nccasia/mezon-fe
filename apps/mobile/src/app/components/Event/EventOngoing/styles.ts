import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		titleEvent: {
			fontSize: size.s_14,
			color: colors.textStrong
		},
		onGoingEventTitle: {
			fontSize: size.s_18,
			fontWeight: 'bold',
			color: baseColor.green
		},
		onGoingEventPanel: {
			backgroundColor: colors.secondaryLight,
			borderRadius: size.s_12,
			padding: size.s_12,
			margin: size.s_12
		},
		detailButton: {
			backgroundColor: baseColor.green,
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: size.s_12,
			padding: size.s_8,
			borderRadius: size.s_20
		},
		titleRow: {
			flexDirection: 'row',
			gap: size.s_8,
			alignItems: 'center'
		}
	});
