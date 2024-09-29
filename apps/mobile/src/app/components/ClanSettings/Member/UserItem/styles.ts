import { Attributes, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		container: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: size.s_10,
			paddingLeft: size.s_10,
			backgroundColor: colors.primary
		},
		rightContent: {
			display: 'flex',
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'space-between',
			flexBasis: size.s_10,
			flexGrow: 1,
			padding: size.s_10
		},
		displayName: {
			color: colors.text,
			fontWeight: 'bold'
		},
		username: {
			color: colors.text
		},
		roleWrapper: {
			flexDirection: 'row',
			flexWrap: 'wrap',
			gap: size.s_8,
			marginTop: size.s_10
		},
		roleContainer: {
			borderRadius: size.s_6,
			backgroundColor: colors.tertiary,
			paddingHorizontal: size.s_6,
			paddingVertical: size.s_2,
			flexDirection: 'row',
			gap: size.s_6,
			alignItems: 'center'
		},
		roleTitle: {
			color: colors.text,
			fontWeight: 'bold'
		},
		roleCircle: {
			height: size.s_10,
			width: size.s_10,
			borderRadius: size.s_6,
			backgroundColor: Colors.bgToggleOnBtn
		},
		icon: {
			width: 30,
			height: 20,
			flexBasis: 20
		},
		content: {
			flexBasis: size.s_10,
			flexGrow: 1
		}
	});
