import { Attributes, Colors, size } from "@mezon/mobile-ui";
import { StyleSheet } from "react-native";

export const style = (colors: Attributes) => StyleSheet.create({
    loadMoreChannelMessage: {
        paddingVertical: size.s_20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    wrapperChannelMessage: {
		flex: 1,
		justifyContent: 'space-between',
		backgroundColor: colors.secondary,
	},

    listChannels: {
		paddingTop: size.s_14,
		backgroundColor: colors.secondary,
	},

    btnScrollDown: {
		position: 'absolute',
		right: size.s_10,
		bottom: size.s_20,
		backgroundColor: colors.primary,
		width: size.s_50,
		height: size.s_50,
		borderRadius: size.s_50,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: Colors.black,
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 8,
		zIndex: 1000,
	},

    typingLabel: {
		paddingHorizontal: size.s_14,
		paddingVertical: size.s_6,
		fontSize: size.s_14,
		color: Colors.textGray,
	},

    overlay: {
		position: 'absolute',
		alignItems: 'center',
		justifyContent: 'center',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(000,000,000,0.8)',
	},
})