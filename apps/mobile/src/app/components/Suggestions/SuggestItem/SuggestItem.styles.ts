import { Attributes, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';
export const style = (colors: Attributes) => StyleSheet.create({
	wrapperItem: {
		flexDirection: 'row',
		borderBottomColor: colors.borderDim,
		borderBottomWidth: 0.5,
		paddingHorizontal: 10,
		paddingVertical: 10,
		backgroundColor: colors.secondary,
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	containerItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	title: {
		fontSize: size.label,
		fontWeight: '600',
		color: colors.text,
	},
	image: {
		width: 40,
		height: 40,
		borderRadius: 50,
	},
	symbol: {
		fontSize: size.label,
		fontWeight: '600',
		color: colors.text
	},
	subText: {
		fontSize: size.medium,
		fontWeight: '500',
		color: colors.text,
	},
	avatarMessageBoxDefault: {
		width: 40,
		height: 40,
		borderRadius: size.s_50,
		backgroundColor: colors.text,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textAvatarMessageBoxDefault: {
		fontSize: size.s_22,
		color: colors.text,
	},
	emojiImage: { width: size.s_20, height: size.s_20 },
});
