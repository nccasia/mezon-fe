import { Attributes, baseColor, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes, height: number, width: number) => StyleSheet.create({
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
	},
	borderBoxImage: {
		borderColor: colors.secondary,
		borderWidth: 5,
	},
	image: {
		width: '100%',
		height: '100%',
	},
	textAvatarMessageBoxDefault: {
		fontSize: size.s_30,
		color: Colors.white,
	},
	statusCircle: {
		position: 'absolute',
		width: height / 3,
		height: width / 3,
		borderRadius: 10,
		bottom: 0,
		right: -width / 20,
		borderWidth: 2,
		borderColor: colors.secondary,
	},
	online: {
		backgroundColor: baseColor.green,
	},
	offline: {
		backgroundColor: baseColor.gray,
	},

	avatarMessageBoxDefault: {
		width: '100%',
		height: '100%',
		backgroundColor: Colors.titleReset,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	}
});
