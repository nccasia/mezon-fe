import { Attributes, Fonts } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		backgroundStyle: {
			backgroundColor: colors.primary
		},

		header: {
			display: 'flex',
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center'
		},

		section: {
			flex: 1
		},

		sectionTitle: {
			textAlign: 'center',
			color: colors.textStrong,
			fontWeight: 'bold',
			flexGrow: 1,
			flexBasis: 10,
			fontSize: Fonts.size.medium
		},

		titleSM: {},

		titleMD: {
			fontSize: Fonts.size.h6
		},

		titleLg: {},
		sectionRight: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-end'
		},

		sectionLeft: {
			display: 'flex',
			flexDirection: 'row',
			justifyContent: 'flex-start'
		},
		handleIndicator: {
			backgroundColor: colors.bgInputPrimary
		}
	});
