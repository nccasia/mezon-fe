import { Attributes, baseColor, Colors, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes, height: number, width: number, n = 1) =>
	StyleSheet.create({
		containerItem: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			borderRadius: size.s_50,
			position: 'relative'
		},
		boxImage: {
			borderRadius: size.s_50,
			overflow: 'hidden'
		},
		borderBoxImage: {
			borderColor: colors.secondary,
			borderWidth: height / 10 > 5 ? 5 : height / 10
		},
		image: {
			width: '100%',
			height: '100%'
		},
		textAvatarMessageBoxDefault: {
			fontSize: size.s_30,
			color: Colors.white
		},
		statusCircle: {
			position: 'absolute',
			width: height / 3,
			height: width / 3,
			borderRadius: height / 6,
			bottom: 0,
			right: -width / 20,
			borderWidth: 2,
			borderColor: colors.secondary
		},
		online: {
			backgroundColor: baseColor.green
		},
		offline: {
			backgroundColor: baseColor.gray
		},

		avatarMessageBoxDefault: {
			width: '100%',
			height: '100%',
			backgroundColor: Colors.titleReset,
			flexDirection: 'row',
			alignItems: 'center',
			justifyContent: 'center'
		},

		listImageFriend: {
			flexDirection: 'row',
			alignItems: 'center',
			flex: 1,
			justifyContent: 'flex-end',
			width: (width - 20) * n + 20,
			height: height
		},

		imageContainer: {
			position: 'absolute',
			borderRadius: size.s_50,
			overflow: 'hidden'
		}
	});
