import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	channelLabelWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		paddingTop: size.s_16,
		gap: size.s_12,
	},
	channelText: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	channelLabel: {
		color: Colors.white,
		marginLeft: 10,
		fontSize: size.h5,
	},
	groupAvatar: {
		backgroundColor: Colors.bgToggleOnBtn,
		borderRadius: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	friendAvatar: {
		borderRadius: 50,
	},
	statusCircle: {
		position: 'absolute',
		width: 14,
		height: 14,
		borderRadius: 10,
		bottom: 0,
		right: 0,
		borderWidth: 2,
		borderColor: Colors.secondary,
	},
	online: {
		backgroundColor: Colors.green,
	},
	offline: {
		backgroundColor: Colors.bgGrayDark,
	},
	avatarSize: {
		width: size.s_50,
		height: size.s_50,
	},
	avatarWrapper: {
		alignItems: 'center',
		gap: size.s_14,
	},
	iconBackHeader: {
		position: 'absolute',
		left: size.s_2,
		top: size.s_10,
		padding: size.s_10,
	},
});
