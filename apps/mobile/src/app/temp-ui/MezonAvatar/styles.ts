import { Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
	containerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderRadius: 50,
		position: 'relative',
	},
	boxImage: {
		borderRadius: 50,
		overflow: 'hidden',
		borderColor: Colors.gray48,
		borderWidth: 5,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	textAvatarMessageBoxDefault: {
		fontSize: size.s_22,
		color: Colors.white,
	},
	statusCircle: {
		position: 'absolute',
		width: size.s_18,
		height: size.s_18,
		borderRadius: 10,
		bottom: 1,
		right: 5,
		borderWidth: 2,
		borderColor: Colors.secondary,
	},
	online: {
		backgroundColor: Colors.green,
	},
	offline: {
		backgroundColor: Colors.bgGrayDark,
	},
});
