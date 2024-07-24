import { Attributes, baseColor, size } from "@mezon/mobile-ui";
import { Dimensions, Platform, StyleSheet } from "react-native";
const width = Dimensions.get('window').width;
const inputWidth = width * 0.6;
export const style = (colors: Attributes) => StyleSheet.create({
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
		borderRadius: size.s_22,
	},
  inputStyle: {
		maxHeight: size.s_40 * 2,
		lineHeight: size.s_20,
		width: inputWidth,
		borderBottomWidth: 0,
		borderRadius: size.s_20,
		paddingLeft: Platform.OS === 'ios' ? size.s_16 : size.s_20,
		paddingRight: size.s_40,
		fontSize: size.medium,
		paddingTop: size.s_8,
		backgroundColor: colors.tertiary,
		color: colors.textStrong,
		textAlignVertical: 'center',
	},
  iconEmoji: {
		position: 'absolute',
		right: 10,
		top: size.s_8,
	},
  iconSend: {
		backgroundColor: baseColor.blurple,
	},
})