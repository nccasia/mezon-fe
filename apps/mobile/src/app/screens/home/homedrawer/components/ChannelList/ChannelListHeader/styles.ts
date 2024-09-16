import { IS_TABLET } from '@mezon/mobile-components';
import { Attributes, Colors, Fonts, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		listHeader: {
			width: '100%',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			position: 'absolute',
			top: 2,
			left: 0,
			padding: Metrics.size.m,
			gap: Metrics.size.s
		},

		titleNameWrapper: {
			maxWidth: '85%',
			display: 'flex',
			backgroundColor: colors.primary,
			paddingHorizontal: size.s_10,
			paddingVertical: size.s_4,
			borderRadius: 20,
			flexDirection: 'row',
			justifyContent: 'space-between',
			gap: IS_TABLET ? Metrics.size.m : Metrics.size.s,
			alignItems: 'center'
		},

		titleServer: {
			color: colors.text,
			fontWeight: 'bold',
			fontSize: size.s_15, 
			flexShrink: 1
		},

		infoHeader: {
			width: '100%',
			display: 'flex',
			flexDirection: 'row',
			gap: 5,
			alignItems: 'center'
		},

		textInfo: {
			color: Colors.gray72,
			fontSize: Fonts.size.h9
		},

		actions: {
			padding: 4,
			borderRadius: 999
		},

		container: {
			height: 150,
			width: '100%',
			position: 'relative',
			marginBottom: Metrics.size.xl
		}
	});
