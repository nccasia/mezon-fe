import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	wrapper: {
		width: '100%',
		height: '100%',
	},
	userAvatar: {
		position: 'absolute',
		bottom: '-25%',
		paddingLeft: size.s_14,
	},
	backdrop: {
		height: 120,
		position: 'relative',
		marginBottom: size.s_20,
	},
	container: {
		paddingHorizontal: size.s_14,
		paddingVertical: size.s_50,
	},
	userInfo: {
		backgroundColor: Colors.secondary,
		marginBottom: size.s_20,
		padding: size.s_16,
		borderRadius: 8,
	},
	userName: {
		color: Colors.white,
		fontSize: size.h6,
		fontWeight: '600',
	},
	subUserName: {
		color: Colors.white,
		fontSize: size.medium,
		fontWeight: '400',
	},
	userAction: {
		marginTop: size.s_20,
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	actionItem: {
		flexDirection: 'column',
		alignItems: 'center',
		padding: size.s_10,
		gap: size.s_6,
	},
	actionText: {
		color: Colors.textGray,
		fontSize: size.medium,
	},
	aboutMe: {
		color: Colors.white,
		fontSize: size.label,
		fontWeight: '600',
		marginBottom: size.s_10,
	},
	roles: {
		flexDirection: 'row',
		gap: size.s_20,
	},
	roleItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		backgroundColor: Colors.bgGrayLight,
		minWidth: 80,
		padding: size.s_6,
		borderRadius: 8,
	},
	textRole: {
		color: Colors.white,
		fontSize: size.medium,
		fontWeight: '400',
	},
	title: {
		color: Colors.white,
		fontSize: size.label,
		fontWeight: '600',
		marginBottom: size.s_10,
	},
});
