import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	bottomSheetWrapper: {
		flex: 1,
		backgroundColor: Colors.bgCharcoal,
		width: '100%',
		borderTopRightRadius: 8,
		borderTopLeftRadius: 8,
		overflow: 'hidden',
	},
	messageActionsWrapper: {
		paddingTop: size.s_2,
	},
	reactWrapper: {
		flexDirection: 'row',
		gap: 20,
		justifyContent: 'space-between',
		padding: size.s_12,
		alignItems: 'center',
	},
	actionItem: {
		flexDirection: 'row',
		gap: 20,
		paddingHorizontal: size.s_16,
		paddingVertical: size.s_12,
	},
	icon: {
		width: size.s_20,
		height: size.s_20,
	},
	reactIcon: {
		fontSize: size.h4,
		color: Colors.white,
	},
	actionText: {
		color: Colors.white,
	},
	actionIcon: {
		color: Colors.white,
	},
});
