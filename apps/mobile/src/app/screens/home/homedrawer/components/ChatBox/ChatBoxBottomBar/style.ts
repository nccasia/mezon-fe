import { Attributes, baseColor, size } from '@mezon/mobile-ui';
import { Platform, StyleSheet } from 'react-native';
export const style = (colors: Attributes) =>
	StyleSheet.create({
		btnIcon: {
			width: size.s_40,
			height: size.s_40,
			borderRadius: size.s_40,
			alignItems: 'center',
			justifyContent: 'center',
			backgroundColor: colors.tertiary
		},
		wrapperInput: {
			position: 'relative',
			justifyContent: 'center',
			borderRadius: size.s_22
		},
		inputStyle: {
			maxHeight: size.s_40 * 2,
			lineHeight: size.s_20,
			width: '100%',
			borderBottomWidth: 0,
			borderRadius: size.s_20,
			paddingLeft: Platform.OS === 'ios' ? size.s_16 : size.s_20,
			paddingRight: size.s_40,
			fontSize: size.medium,
			paddingTop: size.s_8,
			backgroundColor: colors.tertiary,
			color: colors.textStrong,
			textAlignVertical: 'center'
		},
		iconEmoji: {
			position: 'absolute',
			right: 10
		},
		iconSend: {
			marginLeft: size.s_6,
			backgroundColor: baseColor.blurple
		}
	});
