import { Attributes, Metrics, size } from '@mezon/mobile-ui';
import { StyleSheet } from 'react-native';

export const style = (colors: Attributes) =>
	StyleSheet.create({
		cateContainer: {
			gap: size.s_10
		},
		wrapperCateContainer: {
			paddingVertical: size.s_10
		},
		cateItem: {
			padding: 5,
			borderRadius: size.s_10
		},
		emojisPanel: {
			flexDirection: 'row',
			flexWrap: 'wrap'
		},
		wrapperIconEmoji: {
			width: (Metrics.screenWidth - size.s_22) / 9,
			paddingVertical: size.s_10,
			alignSelf: 'center'
		},
		iconEmoji: {
			width: (Metrics.screenWidth - size.s_20) / 9 - size.s_6,
			height: size.s_30
		},
		displayByCategories: {
			marginBottom: size.s_10
		},
		titleCategories: {
			color: colors.text,
			fontSize: size.medium,
			fontWeight: '600',
			paddingBottom: size.s_4
		},
		textInputWrapper: {
			flexDirection: 'row',
			backgroundColor: colors.primary,
			marginVertical: 10,
			alignItems: 'center',
			paddingHorizontal: 10,
			borderRadius: 10,
			gap: 10
		},
		textInput: {
			color: colors.textStrong,
			flexGrow: 1,
			fontSize: size.medium,
			height: size.s_40
		},
		clanLogo: {
			height: size.s_24,
			width: size.s_24,
			borderRadius: size.s_12,
			overflow: 'hidden'
		}
	});
