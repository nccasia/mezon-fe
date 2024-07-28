import { Attributes, Colors, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) => StyleSheet.create({
	closeIcon: {
		color: Colors.white,
	},
	container: {
		flex: 1,
		backgroundColor: colors.primary,
		paddingHorizontal: size.s_20,
	},
	bgDefault: {
		backgroundColor: colors.primary,
	},
	fill: {
		flex: 1,
	},
	headerWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: Metrics.size.l,
		paddingHorizontal: size.s_10,
		backgroundColor: colors.secondary,
	},
	headerContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		width: '100%',
	},
	textTitle: {
		color: colors.textStrong,
		fontSize: 20,
	},
	confirm: {
		color: colors.textStrong,
		fontSize: 18,
		marginLeft: 10,
	},
});
