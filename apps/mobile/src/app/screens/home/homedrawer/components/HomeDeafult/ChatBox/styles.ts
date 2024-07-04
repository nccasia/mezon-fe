import { Attributes, Colors, baseColor, size } from "@mezon/mobile-ui";
import { Dimensions, Platform, StyleSheet } from "react-native";
const width = Dimensions.get('window').width;
const inputWidth = width * 0.6;

export const style = (colors: Attributes) => StyleSheet.create({
    wrapperChatBox: {
		backgroundColor: colors.secondary,
		borderTopWidth: 0.5,
		borderTopColor: colors.border,
		flexDirection: 'column',
		justifyContent: 'space-between',
	},

    aboveTextBoxWrapper: {
		flexDirection: 'column',
		backgroundColor: colors.primary,
	},

    aboveTextBoxItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: size.tiny,
		padding: size.tiny,
		gap: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},

    aboveTextBoxText: {
		color: colors.text,
		fontSize: size.s_12,
	},

    containerInput: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingVertical: size.s_10,
	},

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
		// backgroundColor: Colors.secondaryLight,
		// paddingVertical: size.s_4,
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
	},
    iconSend: {
		backgroundColor: baseColor.blurple,
	},
});