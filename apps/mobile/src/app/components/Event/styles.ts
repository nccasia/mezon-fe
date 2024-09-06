import { Attributes, Fonts, Metrics } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			padding: Metrics.size.xl,
			gap: Metrics.size.xl
		},
		emptyView: {
			padding: Metrics.size.xl,
			gap: Metrics.size.xxl,
			alignItems: 'center'
		},
		emptyText: {
			color: colors.text,
			textAlign: 'center',
			fontSize: Fonts.size.h7,
			fontWeight: 'bold'
		},
		emptyTextDescription: {
			color: colors.textDisabled,
			textAlign: 'center',
			fontSize: Fonts.size.h8,
			marginTop: Metrics.size.m
		},
		iconWrapper: {
			padding: Metrics.size.l,
			borderRadius: 28,
			backgroundColor: colors.tertiary
		},
		header: {
			display: 'flex',
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between'
		},
		section: {
			flex: 1
		},
		sectionTitle: {
			textAlign: 'center',
			color: colors.textStrong,
			fontSize: Fonts.size.medium,
			fontWeight: 'bold',
			flexGrow: 1,
			flexBasis: 10
		},
		titleMD: {
			fontSize: Fonts.size.h6
		},
		sectionRight: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end',
			paddingRight: Metrics.size.m
		}
	});
